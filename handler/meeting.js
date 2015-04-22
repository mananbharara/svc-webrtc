var Meeting = require('../model/meeting')();

var MeetingHandler = {
  create: function (req, res) {
    var meetingNumber = Meeting.add();

    res.status(201).send({meetingNumber: meetingNumber});
  }
};

module.exports = MeetingHandler;