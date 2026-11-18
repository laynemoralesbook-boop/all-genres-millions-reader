# Security Specification — ALL GENRES MILLIONS READER

## 1. Data Invariants

1. **Identity & Role Integrity**: No user may assign or escalate their own role (`role: 'admin'`) in `users/{userId}` or write to `admins/{uid}`. Admin privileges are strictly derived from `admins/{uid}` existence or verified bootstrapped administrator email (`request.auth.token.email_verified == true`).
2. **PII Isolation**: User profiles (`users/{userId}`), author submissions (`submissions/{submissionId}`), payment records (`payments/{paymentId}`), reading progress (`reading_progress/{progressId}`), and contact messages (`contact_messages/{messageId}`) contain private PII (`email`, `country`, personal notes) and must NEVER be readable by unauthenticated users or non-owners (except admins).
3. **Approval Gate for Public Catalog**: Public `books` and `authors` queries/reads are strictly restricted to documents where `status == 'approved'`. Pending, rejected, or archived records are exclusively readable by administrators.
4. **Payment & Submission State Locking**: Non-admin users creating a submission must start at `status == 'pending_review'` and `paymentStatus == 'unpaid'`. Non-admin users creating a payment record must start at `status == 'pending'`. Only administrators may transition submissions to `approved` / `rejected` or mark payments as `verified` / `refunded` and set promotional active dates.
5. **Immutable Ownership & Server Timestamps**: `userId` and `createdAt` (`request.time`) are immutable after document creation. Every string and list enforces explicit `.size()` boundaries.

## 2. The "Dirty Dozen" Attack Payloads

1. **Privilege Escalation on User Create**: Reader creates `/users/{uid}` with `role: "admin"`. Expected: `PERMISSION_DENIED`.
2. **Admin Registry Injection**: Non-admin writes `/admins/{uid}`. Expected: `PERMISSION_DENIED`.
3. **Unverified Email Spoofing**: Unauthenticated or `email_verified == false` token matching admin email attempts admin write on `/books/{id}`. Expected: `PERMISSION_DENIED`.
4. **PII Blanket Read**: Signed-in reader A attempts `get` or `list` on `/users/{readerB}` or `/submissions` without `userId == auth.uid`. Expected: `PERMISSION_DENIED`.
5. **Pending Book Leak**: Public visitor queries `/books` without `where('status', '==', 'approved')` or reads a `pending` book document. Expected: `PERMISSION_DENIED`.
6. **Self-Approved Submission**: Author submits `/submissions/{id}` with `status: "approved"` or `paymentStatus: "verified"`. Expected: `PERMISSION_DENIED`.
7. **Shadow Field Injection**: Author updates `/users/{uid}` with an undeclared ghost field `isVerified: true`. Expected: `PERMISSION_DENIED`.
8. **Type Poisoning on Array**: Reader sets `favoriteGenres: [12345]` or an array exceeding 12 entries. Expected: `PERMISSION_DENIED`.
9. **ID Poisoning**: Attacker targets `/books/invalid$$$id` or a 500-character document ID. Expected: `PERMISSION_DENIED`.
10. **Payment Amount/Status Tampering**: Author creates `/payments/{id}` with `status: "verified"` or `amountUsd: 0`. Expected: `PERMISSION_DENIED`.
11. **Timestamp Forgery**: Client submits `createdAt` in the past or future instead of `request.time`. Expected: `PERMISSION_DENIED`.
12. **Site Settings Defacement**: Non-admin user updates `/site_settings/main`. Expected: `PERMISSION_DENIED`.
