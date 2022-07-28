const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if(context.user){
      const userD = await User.findOne({_id:context.user._id})  
      .select("-__v -password")
      return userD ;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
// This mutation allows us to create a user and check the users credentials
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create({args});
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);
      return { token, user };
    },

// Save book resolver
    saveBook: async (parent, {Book}, context) => {
      if (context.user) {
        const updateUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: book } },
          {new:true}
        );

        return updateUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },

//  Remove Book reseolver
    removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
          const updateUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: {bookId: bookId } } },
            {new:true}
          );

        return updateUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
};

module.exports = resolvers;
