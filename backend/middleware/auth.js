import jwt from 'jsonwebtoken'

export const protect = (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null)
    if (!token) {
      res.status(401)
      throw new Error('Not authorized')
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: decoded.id }
    next()
  } catch (err) {
    res.status(401)
    next(err)
  }
}
