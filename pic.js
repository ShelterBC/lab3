export const pic = {
  figs: [],
  sPoints: [],
  rPoints: [],
  skLines: [],
  pushFig(...figs) {
    this.figs.push(...figs);
  },
  pushSPoint(p) {
    this.sPoints.push(p);
  },
  pushRPoint(p) {
    this.rPoints.push(p);
  },
  clearFigs() {
    this.figs = [];
  },
  clearSPoints() {
    this.sPoints = [];
  },
  clearRPoints() {
    this.rPoints = [];
  },
  clearSkLines() {
    this.skLines = [];
  },
  pushSkLine(s, e) {
    this.skLines.push({
      pStart: { x: s.x, y: s.y },
      pEnd: { x: e.x, y: e.y },
    });
  },
};
