const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET;



router.post('/register', async (req, res) => {
  try {
    console.log(req.body);



    const { email, password } = req.body;

    console.log(email, password);
    console.log("register fonksiyonu çalıştı");

    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre gereklidir' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email zaten kullanılıyor' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ email, password: hashedPassword });

    await user.save();
    res.status(201).json({ message: 'Kayıt başarılı' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {

  const { email, password } = req.body;

  console.log(email, password);
  console.log("login fonksiyonu çalıştı");

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Kullanıcı bulunamadı' });


  console.log("user.password :" , user.password);
  console.log("password :" , password);


  const isMatch = await bcrypt.compare(password, user.password);
  console.log(isMatch);

  if (!isMatch) return res.status(401).json({ error: 'Hatalı şifre' });

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

module.exports = router;