class TeamMatchRecord {
  constructor() {
    this.scout= "unknown",
    this.team = "0000",
    this.match = 0,
    this.event =  '',
    this.auton = {
      collection : {
        neutral: 0,
        depot: 0,
        outpost: 0,
      },
      cyclesScoring: 0,
      fillPercent: {
        max: 0,
        min: 0,
        avg: 0,
        median: 0
      },
      shotRate: {
        max: 0,
        min: 0,
        avg: 0,
        median: 0
      },
      shotAccuracy: {
        max: 0,
        min: 0,
        avg: 0,
        median: 0
      },
      mobility: false
    };
    this.teleop = {
     collection : {
        neutral: 0,
        depot: 0,
        outpost: 0,
        opposing: 0
      },
      cyclesScoring:  0,
      cyclesPassing: 0,
      cyclesDefense: 0,
      fillPercent: {
        max: 0,
        min: 0,
        avg: 0,
        median: 0
      },
      shotRate: {
        max: 0,
        min: 0,
        avg: 0,
        median: 0
      },
      shotAccuracy: {
        max: 0,
        min: 0,
        avg: 0,
        median: 0
      },
      penalties: 0,
      fouls:0,
      mobility: false

    };
    this.endgame = {
      climbStatus: 'None',
      cyclesScoring:  0,
      cyclesPassing: 0,
      cyclesDefense: 0,
      fillPercent: {
        max: 0,
        min: 0,
        avg: 0,
        median: 0
      },
      shotRate: {
        max: 0,
        min: 0,
        avg: 0,
        median: 0
      },
      shotAccuracy: {
        max: 0,
        min: 0,
        avg: 0,
        median: 0
      },
      penalties: 0,
      fouls:0,
    };
    this.observations = {
      brokeDown: 0,
      superAwesome:0,

    };
    this.notes = '';
  }
}


function summarizeTeamMatchByScout(data) {
  const summary = new TeamMatchRecord();
  summary.team = data.team;
  summary.scout = data.scout;
  summary.match = data.match;
  summary.event = data.event;
  summary.observations = data.observations;

  if (data.teleop) {
     summarizeTeleop(data.teleop, summary);
  }
  if (data.auton) {
    summarizeAuton(data.auton, summary);

  }
  if (data.endgame) {
     summarizeEndgame(data.endgame, summary);
  }

}

function summarizeAuton(data, summary) {
    summary.cyclesScoring = data.scoring.length;
    

}

function summarizeTeleop(data, summary) {
   summary.cyclesScoring = data.scoring.length;
   summary.cyclesDefense = data.defense.length;
   summary.cyclesPassing = data.passing.length;

}

function summarizeEndgame(data, summary) {
    summary.cyclesScoring = data.scoring.length;
    summary.cyclesPassing = data.passing.length;
}




export default {
  scoutedTeamMatchSummary: summarizeTeamMatchByScout

}
