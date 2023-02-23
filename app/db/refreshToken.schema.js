const config = require("../config/auth.config");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, Sequelize) => {
  const RegreshToken = sequelize.define("refreshToken", {
    userId:{
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
      foreignKey: true
    },
    token: {
      type: Sequelize.STRING,
    },
    expires: {
      type: Sequelize.DATE,
    },
  });


  RegreshToken.createToken = async function(user) {
    try {
      let expiredAt = new Date();

      expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration);

      let _token = uuidv4();

      let refreshToken = await this.create({
        token: _token,
        userId: user.id,
        expires: expiredAt.getTime(),
      });

      return refreshToken.token;
    } catch(error) {
      error.status = error.status || 500;
      if (error.name === "SequelizeUniqueConstraintError")
        error.message = "The user is already logged in";
      throw { message: error.message, status: error.status };
    }
  };

  RegreshToken.verifyExpiration = (token) => {
    return token.expires.getTime() < new Date().getTime();
  };

  return RegreshToken;
};
