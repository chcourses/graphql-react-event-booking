const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

const events = async eventIds => {
  try {
    const results = await Event.find( { _id: {$in: eventIds} });
    return results.map(event => {
      return { ...event._doc, _id: event.id, creator: user.bind(this, event.creator) }
    }) 
  } catch (ex) {
    throw ex
  }
}

const user = async userId => {
  try {
    const userData = await User.findById(userId);
    return { ...userData._doc, _id: userData.id, createdEvents: events.bind(this, userData._doc.createdEvents) }
  } catch(ex) {
    throw ex
  }
}

module.exports = { 
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        return {
          ...event._doc, 
          _id: event.id, 
          creator: user.bind(this, event._doc.creator)
        };
      });
    } catch(err) {
      throw err
    }

  },
  createEvent: async args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: '5c22a46b9fabfe2554e03a03'
    });
    try {
      const result = await event.save();
      const creator = await User.findById('5c22a46b9fabfe2554e03a03');
      if (!creator) {
        throw new Error('This creator does not exist');
      } else {
        await creator.createdEvents.push(event);
        await creator.save();
      }
      return {...result._doc, _id: event._doc._id.toString(), creator: user.bind(this, result._doc.creator) };
    } catch (err) {
      console.log("ERROR!: " + err)
      throw err;
    }
  },
  createUser: async args => {
    try {
      const emailExists = await User.findOne({ email: args.userInput.email });
      if (emailExists) {
        throw new Error('User already exists.');
      }
      const hashedPass = await bcrypt.hash(args.userInput.password, 12);
      const user = new User({
        email: args.userInput.email,
        password: hashedPass
      })
      const savedUser = await user.save();
      return { ...savedUser._doc, _id: savedUser.id, password: null }
    } catch (ex) {
      throw ex
    }

  }
 }