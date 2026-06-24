import express from 'express';
// ... بقية الـ imports الخاصة بك

const app = express();

// ... كل الـ routes الخاصة بك (مثل app.post('/api/ask', ...))

// احذف سطر app.listen(PORT, ...) تماماً!

// أضف هذا التصدير:
export default app;