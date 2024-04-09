const createUserToken = require("../helpers/create-user-token");
const User = require("../models/User");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//helpers
const createUsersToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");

module.exports = class UserController {
  static async register(req, res) {
    const { nome, email, senha, confirmarsenha } = req.body;

    // Validações
    if (!nome || !email || !senha || !confirmarsenha) {
      res.status(422).json({ message: "Todos os campos são obrigatórios." });
      return;
    }

    if (senha !== confirmarsenha) {
      res.status(422).json({ message: "A senha e a confirmação da senha não coincidem." });
      return;
    }

    // Verifica se o usuário já existe no banco de dados
    try {
      const userExists = await User.findOne({ where: { email: email } });
      if (userExists) {
        res.status(422).json({ message: "Já existe um usuário registrado com este e-mail." });
        return;
      }
    } catch (error) {
      res.status(500).json({ message: "Erro ao verificar usuário existente." });
      return;
    }

    // Criptografa a senha
    const saltRounds = 12;
    try {
      const hashedPassword = await bcrypt.hash(senha, saltRounds);
      
      // Cria um novo usuário
      const newUser = await User.create({
        nome: nome,
        email: email,
        senha: hashedPassword
      });

      res.status(201).json({ message: "Usuário registrado com sucesso." });
    } catch (error) {
      res.status(500).json({ message: "Erro ao registrar usuário." });
    }
  }




  static async login(req, res) {
    const { email, password } = req.body;

    if (!email) {
      res.status(422).json({ message: " O email é obrigatório!!" });
      return;
    }

    if (!password) {
      res.status(422).json({ message: " A senha é obrigatória!!" });
      return;
    }

    // check if user exists
    const user = await User.findOne({ email: email });

    if (!user) {
      res.status(422).json({ message: " Não há usuario com esse email!!" });
      return;
    }

    // check if password match with db password
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      res.status(422).json({ message: " Senha inválida!!" });
      return;
    }

    await createUserToken(user, req, res);
  }

  static async checkUser(req, res) {
    let currentUser;

    if (req.headers.authorization) {
      const token = getToken(req);
      const decoded = jwt.verify(token, "nossosecret");

      currentUser = await User.findById(decoded.id);
      currentUser.password = undefined;
    } else {
      currentUser = null;
    }
    res.status(200).send(currentUser);
  }

  static async getUserById(req, res) {
    const id = req.params.id;
    const user = await User.findById(id).select("-password");
    if (!user) {
      res.status(422).json({ message: " Usuário não encontrado!!" });
      return;
    }
    res.status(200).json({ user });
  }

  static async editUser(req, res) {
    const id = req.params.id;

    //check if user exists
    const token = getToken(req);
    const user = await getUserByToken(token);

    const { name, email, phone, password, confirmpassword } = req.body;

    if (req.file) {
      user.image = req.file.filename;
    }

    if (!name) {
      res.status(422).json({ message: " O nome é obrigatório!!" });
      return;
    }

    if (!email) {
      res.status(422).json({ message: " O email é obrigatório!!" });
      return;
    }

    //check if email has already taken
    const userExists = await User.findOne({ email: email });

    if (user.email !== email && userExists) {
      res.status(422).json({ message: " Por favor, utilize outro email!!" });
      return;
    }

    user.email = email;

    if (password !== confirmpassword) {
      res
        .status(422)
        .json({ message: " A senha e a confirmação são diferentes !!" });
      return;
    } else if (password === confirmpassword && password != null) {
      // creating password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      user.password = passwordHash;
    }

    try {
      // returns user updated data

      await User.findByIdAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      );
      res.status(200).json({
        message: "Usuário atualizado com sucesso!!!",
      });
    } catch (error) {
      res.status(500).json({ message: error });
      return;
    }
  }
};
