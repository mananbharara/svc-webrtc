var Meeting = function () {
  var meetings = {};

  function add() {
    var meetingId = guid();
    meetings[meetingId] = [];

    return meetingId;
  }

  function update(meetingId, meeting) {
    meetings[meetingId] = meeting;

    return meetings[meetingId];
  }

  function get(meetingId) {
    return meetings[meetingId];
  }

  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

  return {
    add: add,
    get: get,
    update: update
  }
};

module.exports = Meeting;