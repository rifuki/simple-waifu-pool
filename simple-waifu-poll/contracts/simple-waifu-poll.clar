;; ---------- CONSTANTS / ERROR CODES ----------
(define-constant ERR_TOO_FEW_OPTIONS u100)
(define-constant ERR_TOO_MANY_OPTIONS u101)
(define-constant ERR_POLL_NOT_FOUND u102)
(define-constant ERR_ALREADY_VOTED u103)
(define-constant ERR_POLL_CLOSED u104)
(define-constant ERR_OUT_OF_RANGE_OPTION u105)
(define-constant ERR_TOO_LONG_QUESTION u106)
(define-constant ERR_TOO_LONG_OPTION u107)
(define-constant ERR_DURATION_ZERO u108)
(define-constant ERR_DURATION_MAX u109)
(define-constant ERR_ALREADY_CLOSED u110)
(define-constant ERR_TOO_EARLY_FINALIZE u111)

(define-constant MAX_OPTIONS u5)
(define-constant MIN_OPTIONS u2)
(define-constant MAX_QUESTION_LEN u80)
(define-constant MAX_OPTION_LEN u40)
(define-constant MAX_DURATION u10000)

;; ---------- STATE ----------
(define-data-var next-poll-id uint u0)

(define-map polls
  { id: uint }
  {
    question: (string-ascii 80),
    creator: principal,
    start: uint,
    end: uint,
    option-count: uint,
    status: uint        ;; 0 = open, 1 = closed
  }
)

(define-map poll-options
  { id: uint, index: uint }
  { text: (string-ascii 40) }
)

(define-map votes
  { id: uint, voter: principal }
  { choice: uint }
)

(define-map counts
  { id: uint, index: uint }
  { total: uint }
)

;; ---------- HELPERS ----------
(define-read-only (poll-exists (poll-id uint))
  (is-some (map-get? polls {id: poll-id}))
)

(define-read-only (poll-open? (p (tuple (question (string-ascii 80))
                                        (creator principal)
                                        (start uint)
                                        (end uint)
                                        (option-count uint)
                                        (status uint))))
  (and (is-eq (get status p) u0)
       (<= stacks-block-height (get end p)))
)

(define-private (increment-count (poll-id uint) (choice uint))
  (let ((curr (default-to {total: u0} (map-get? counts {id: poll-id, index: choice}))))
    (map-set counts {id: poll-id, index: choice} {total: (+ (get total curr) u1)})
  )
)

;; ---------- PUBLIC: CREATE ----------
(define-public (create-poll
    (question (string-ascii 80))
    (option1 (string-ascii 40))
    (option2 (string-ascii 40))
    (option3 (optional (string-ascii 40)))
    (option4 (optional (string-ascii 40)))
    (option5 (optional (string-ascii 40)))
    (duration uint)
  )
  (begin
    ;; basic validation
    (asserts! (> (len question) u0) (err ERR_TOO_LONG_QUESTION))
    (asserts! (<= (len question) MAX_QUESTION_LEN) (err ERR_TOO_LONG_QUESTION))
    (asserts! (> (len option1) u0) (err ERR_TOO_LONG_OPTION))
    (asserts! (> (len option2) u0) (err ERR_TOO_LONG_OPTION))
    (asserts! (<= (len option1) MAX_OPTION_LEN) (err ERR_TOO_LONG_OPTION))
    (asserts! (<= (len option2) MAX_OPTION_LEN) (err ERR_TOO_LONG_OPTION))
    (asserts! (> duration u0) (err ERR_DURATION_ZERO))
    (asserts! (<= duration MAX_DURATION) (err ERR_DURATION_MAX))

    (let (
          (pid (var-get next-poll-id))
          (start stacks-block-height)
          (end (+ stacks-block-height duration))
          (o3c (if (is-some option3) u1 u0))
          (o4c (if (is-some option4) u1 u0))
          (o5c (if (is-some option5) u1 u0))
          (count-options (+ u2 (+ o3c (+ o4c o5c))))
         )
      (asserts! (>= count-options MIN_OPTIONS) (err ERR_TOO_FEW_OPTIONS))
      (asserts! (<= count-options MAX_OPTIONS) (err ERR_TOO_MANY_OPTIONS))

      ;; store poll meta
      (map-set polls {id: pid} {
        question: question,
        creator: tx-sender,
        start: start,
        end: end,
        option-count: count-options,
        status: u0
      })

      ;; mandatory first 2 options
      (map-set poll-options {id: pid, index: u0} {text: option1})
      (map-set poll-options {id: pid, index: u1} {text: option2})

      ;; optional options: compute indices sequentially
      (if (is-some option3)
          (begin
            (map-set poll-options {id: pid, index: u2} {text: (unwrap-panic option3)})
            true)
          true)

      (if (is-some option4)
          (begin
            (map-set poll-options
                     {id: pid, index: (+ u2 o3c)}
                     {text: (unwrap-panic option4)})
            true)
          true)

      (if (is-some option5)
          (begin
            (map-set poll-options
                     {id: pid, index: (+ u2 (+ o3c o4c))}
                     {text: (unwrap-panic option5)})
            true)
          true)

      (var-set next-poll-id (+ pid u1))
      (ok pid)
    )
  )
)

;; ---------- PUBLIC: VOTE ----------
(define-public (vote (poll-id uint) (choice uint))
  (let ((p (unwrap! (map-get? polls {id: poll-id}) (err ERR_POLL_NOT_FOUND))))
    (asserts! (poll-open? p) (err ERR_POLL_CLOSED))
    (asserts! (< choice (get option-count p)) (err ERR_OUT_OF_RANGE_OPTION))
    (asserts! (is-none (map-get? votes {id: poll-id, voter: tx-sender})) (err ERR_ALREADY_VOTED))
    ;; Additional validation to satisfy static analysis
    (asserts! (and (>= poll-id u0) (<= poll-id u4294967295)) (err ERR_POLL_NOT_FOUND))
    (asserts! (and (>= choice u0) (< choice u5)) (err ERR_OUT_OF_RANGE_OPTION))
    (map-set votes {id: poll-id, voter: tx-sender} {choice: choice})
    (increment-count poll-id choice)
    (ok true)
  )
)

;; ---------- PUBLIC: FINALIZE ----------
(define-public (finalize (poll-id uint))
  (let ((p (unwrap! (map-get? polls {id: poll-id}) (err ERR_POLL_NOT_FOUND))))
    (asserts! (is-eq (get status p) u0) (err ERR_ALREADY_CLOSED))
    (asserts! (> stacks-block-height (get end p)) (err ERR_TOO_EARLY_FINALIZE))
    ;; Additional validation to satisfy static analysis
    (asserts! (and (>= poll-id u0) (<= poll-id u4294967295)) (err ERR_POLL_NOT_FOUND))
    (map-set polls {id: poll-id} (merge p {status: u1}))
    (ok true)
  )
)

;; ---------- READ-ONLY ----------
(define-read-only (get-poll (poll-id uint))
  (map-get? polls {id: poll-id})
)

(define-read-only (get-option (poll-id uint) (index uint))
  (map-get? poll-options {id: poll-id, index: index})
)

(define-read-only (get-vote-count (poll-id uint) (index uint))
  (let ((c (map-get? counts {id: poll-id, index: index})))
    (if (is-some c)
        (ok (get total (unwrap-panic c)))
        (ok u0))
  )
)

(define-read-only (get-user-vote (poll-id uint) (user principal))
  (map-get? votes {id: poll-id, voter: user})
)
