exports.timezone = 'America/New_York'

const goals = [
  'anki',
  'stu',
  'ghostwriter',
  'infrastructure',
  'dat',
  'sudomesh'
]

exports.daily = [
  {
    deadline: '6am',
    objective: 'wake up'
  },

  {
    deadline: '6:15',
    objective: 'take theanine'
  },

  {
    deadline: '6:30am',
    objective: 'wash'
  },

  {
    deadline: '7:45am',
    objective: 'meditate'
  },

  {
    deadline: '8am',
    objective: `hack on ${goals.pop()}`
  },

  {
    deadline: '8:15am',
    objective: `hack on ${goals.pop()}`
  },

  {
    deadline: '8:30am',
    objective: 'get ready leave'
  },

  {
    deadline: '8:55am',
    objective: 'catch the 8:55am C train towards 168 St'
  },

  {
    deadline: '10:15am',
    objective: `hack on ${goals.pop()}`
  },

  {
    deadline: '11am',
    objective: `hack on ${goals.pop()}`
  },

  {
    deadline: '12pm',
    objective: 'plan lunch'
  },

  {
    deadline: '1pm',
    objective: 'eat lunch'
  },

  {
    deadline: '1:05pm',
    objective: 'log lunch'
  },

  {
    deadline: '1:45pm',
    objective: `hack on ${goals.pop()}`
  },

  {
    deadline: '2:45pm',
    objective: 'participate in PLP'
  },

  {
    deadline: '5:00pm',
    objective: `hack on ${goals.pop()}`
  },

  {
    deadline: '5:15pm',
    objective: 'form a plan for eating dinner'
  },

  {
    deadline: '6:30pm',
    objective: 'eat dinner'
  },

  {
    deadline: '7:30pm',
    objective: 'go home'
  },

  {
    deadline: '8:00pm',
    objective: 'write'
  },

  {
    deadline: '8:20pm',
    objective: 'draw'
  },

  {
    deadline: '8:40pm',
    objective: 'wash'
  },

  {
    deadline: '9:00pm',
    objective: 'meditate'
  },

  {
    deadline: '9:30pm',
    objective: 'read a book'
  }
]
