const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const {graphqlHTTP} = require('express-graphql');
const { ApolloServer, gql } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');

const saltRounds = 10;

const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(cors());
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'text/javascript');
      }
    }
}));

const upload = multer({ storage: storage });

mongoose.connect('mongodb://127.0.0.1:27017/weight-tracker', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((err) => {
        console.log(err);
    });

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
const Users = mongoose.model('Users', userSchema);

const weightSchema = new mongoose.Schema({
    date: Date,
    weight: Number,
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Users' }
});
const Weight = mongoose.model('Weight', weightSchema);

const fileSchema = new mongoose.Schema({
    file: String,
});
const File = mongoose.model('File', fileSchema);

const JWT_SECRET = 'hello123';

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const typeDefs = gql`
  type Mutation {
    loginMutation(username: String!, password: String!): AuthPayload!
    registerMutation(username: String!, password: String!): AuthPayload!
    exitMutation(user: UserInput!, token: String!): Exit!
    addMutation(userId: String, token: String, data: WeightInput, files: [FileU]): Resp!
    deleteMutation(userId: String, token: String, id: String): Resp!
    fdelMutation(userId: String, token: String, id: String): Resp!
    editMutation(userId: String, token: String, id: String, date: String, weight: String): Resp!
  }

  type File {
    _id: ID
    file: String
  }

  type Weight {
    _id: ID
    date: String
    weight: Int
    files: [File]
  }

  input UserInput {
    username: String
    id: ID
  }

  input FileU {
    payload: String
    name: String
  }

  input WeightInput {
    date: String
    weight: String
  }

  type Resp {
    success: Boolean
  }

  type Exit {
    token: String  
    user: User
  }

  type AuthPayload {
    success: Boolean
    token: String
    user: User
  }

  type User {
    username: String
    id: ID
  }

  type Query {
    getWeights(userId: String, token: String): [Weight]
  }
`;

const resolvers = {
  Query: {
    getWeights: async (_, { userId, token }) => {
      try {
        if (token) {
          const decodedData = jwt.verify(token, JWT_SECRET);
        } else {
          throw new Error('Token is not provided');
        }
      } catch (e) {
        console.log(e);
        throw new Error('Failed to verify token');
      }
      const weights = await Weight.find({ user: userId }).populate('files').exec();
      return weights;
    },
  },
  Mutation: {
    editMutation: async (_, { userId, token, id, date, weight }) => {
      const decodedData = jwt.verify(token, JWT_SECRET);
      const updatedWeight = {
        date: date,
        weight: weight,
        user: userId
      };
      try {
        const weight = await Weight.findByIdAndUpdate(id, updatedWeight, { new: true });
        if (!weight) {
          return {
            success: false,
          };
        } else {
          return {
            success: true,
          };
        }
      } catch (err) {
        console.log(err);
        return {
          success: false,
        };
      }
    },
    fdelMutation: async (_, { userId, token, id }) => {
      const decodedData = jwt.verify(token, JWT_SECRET);
      return File.findByIdAndDelete(id)
      .then(file => {
        if (!file) {
          return {
            success: false,
          };
        } else {
          return Weight.findOne({ user: userId, files: id })
          .then(weight => {
            if (!weight) {
              return {
                success: false,
              };
            } else {
              return {
                success: true,
              };
            }
          })
          .catch(err => {
            return {
              success: false,
            };
          });
        }
      })
      .catch(err => {
        return {
          success: false,
        };
      });
    },
    deleteMutation: async (_, { userId, token, id }) => {
      const decodedData = jwt.verify(token, JWT_SECRET);
      try {
        const weight = await Weight.findByIdAndDelete(id);
        if (!weight) {
          return {
            success: false,
          };
        } else {
          await File.deleteMany({ _id: { $in: weight.files } });
          return {
            success: true,
          };
        }
      } catch (err) {
        console.log(err);
        return {
          success: false,
        };
      }
    },
    addMutation: async (_, { userId, token, data, files }) => {
      const decodedData = jwt.verify(token, JWT_SECRET);
      const weight = new Weight({
        date: data.date,
        weight: data.weight,
        user: userId,
        files: []
      });
      try {
        const filesA = [];
        if (files && files.length > 0) {
          for (let i = 0; i < files.length; i++) {
            const base64Data = files[i].payload;
            const binaryData = Buffer.from(base64Data, 'base64');
            const filePath = path.join('./uploads', files[i].name);
            fs.writeFile(filePath, binaryData, (err) => {
              if (err) {
                console.error(err);
              } else {
              }
            });
            const newFile = new File({
              file: files[i].name
            }); 
            filesA.push(newFile);
            await newFile.save();
          }
        }
        weight.files = filesA.map(file => file._id);
        const newWeight = await weight.save();
        return {
          success: true,
        };
      } catch (err) {
        console.log(err);
        return {
          success: false,
        };
      }
    },
    loginMutation: async (_, { username, password }) => {
      if (!username || !password) {
        return {
          success: false,
          token: null,
          user: null,
        };
      }
      try {
        const user = await Users.findOne({ username });
        if (!user || !bcrypt.compareSync(password, user.password)) {
          return {
            success: false,
            token: null,
            user: null,
          };
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        return {
          success: true,
          token,
          user: {
            username: user.username,
            id: user._id,
          },
        };
      } catch (error) {
        console.log(error);
        return {
          success: false,
          token: null,
          user: null,
        };
      }
    },
    registerMutation: async (_, { username, password }) => {
      if (!username || !password) {
        return {
          success: false,
        };
      }
      try {
        const existingUser = await Users.findOne({ username: username });
        if (existingUser) {
          return {
            success: false,
          };
        }
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new Users({
          username,
          password: hashedPassword,
        });
        newUser.save();
        return {
          success: true,
        };
      } catch (error) {
        console.log(error);
        return {
          success: false,
        };
      }
    },
    exitMutation: async (_, { user, token }) => {
      user = null;
      try {
        const decodedData = jwt.verify(token, JWT_SECRET);
        const expiredToken = jwt.sign({ userId: decodedData.userId }, JWT_SECRET, { expiresIn: 0 });
        const formData = {
          token: expiredToken,
          user: {
            username: "0",
            id: "0"
          }
        }
        result = formData;
      } catch (err) {
        console.log('err', err);
        throw new Error('Invalid token');
      }
      return result;
    },
  },
};

const schema = makeExecutableSchema({
  typeDefs: mergeTypeDefs([typeDefs]),
  resolvers: mergeResolvers([resolvers]),
});

const server = new ApolloServer({ 
  schema, 
  formatError: (error) => {
    console.log(error); 
    return error;
  }, 
});
server.start().then(() => {
  server.applyMiddleware({ app });
});

const root = {}

app.use('/graphql', graphqlHTTP({
  graphiql: true,
  schema,
  rootValue: root
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.use(express.static(path.join(__dirname, 'public'), { 'Content-Type': 'text/javascript' }));
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});