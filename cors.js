module.exports = {
  origin: process.env.SERVER_CORS || 'http://localhost:1337',
  credentials: true,
  headers: [
    'DNT',
    'X-Mx-ReqToken',
    'Keep-Alive',
    'User-Agent',
    'X-Requested-With',
    'If-Modified-Since',
    'Cache-Control',
    'Content-Type',
    'Accept',
    'Accept-Encoding',
    'Origin',
    'Referer',
    'Pragma',
    'Cookie'
  ],
  methods: [
    'GET',
    'PUT',
    'POST',
    'DELETE',
    'OPTIONS'
  ],
  maxAge: 1728000
};