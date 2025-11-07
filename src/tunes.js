export const stranger_tune = `
setcps(<tempo>/2)

samples('github:algorave-dave/samples')
samples('https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/strudel.json')
samples('https://raw.githubusercontent.com/Mittans/tidal-drum-machines/main/machines/tidal-drum-machines.json')

/* ---------------- Patterns ---------------- */

const gain_patterns = [
  "1",
  "{0.75 2.5}*4",
  "{0.75 2.5!9 0.75 2.5!5 0.75 2.5 0.75 2.5!7 0.75 2.5!3 <2.5 0.75> 2.5}%16"
]

const drum_structure = [
  "~",
  "x*4",
  "{x ~!9 x ~!5 x ~ x ~!7 x ~!3 < ~ x > ~}%16"
]

const basslines = [
  "[[eb1, eb2]!16 [f2, f1]!16 [g2, g1]!16 [f2, f1]!8 [bb2, bb1]!8]/8",
  "[[eb1, eb2]!16 [bb2, bb1]!16 [g2, g1]!16 [f2, f1]!4 [bb1, bb2]!4 [eb1, eb2]!4 [f1, f2]!4]/8"
]

const arpeggiator1 = [
  "{d4 bb3 eb3 d3 bb2 eb2}%16",
  "{c4 bb3 f3 c3 bb2 f2}%16",
  "{d4 bb3 g3 d3 bb2 g2}%16",
  "{c4 bb3 f3 c3 bb2 f2}%16"
]

const arpeggiator2 = [
  "{d4 bb3 eb3 d3 bb2 eb2}%16",
  "{c4 bb3 f3 c3 bb2 f2}%16",
  "{d4 bb3 g3 d3 bb2 g2}%16",
  "{d5 bb4 g4 d4 bb3 g3 d4 bb3 eb3 d3 bb2 eb2}%16"
]

/* ---------------- PART B CONTROLS ---------------- */

const pattern = <pattern_index>;
const drum2Gain = <drums2_gain>;
const masterGain = <master_gain>;
const roomAmt = <reverb_amount>;

/* ---------------- Tracks ---------------- */

bassline:
note(pick(basslines, pattern))
.sound("supersaw")
.room(roomAmt)
.gain(masterGain)
.lpf(700)
.postgain(pick(gain_patterns, pattern))
<p1_Radio>

main_arp:
note(pick(arpeggiator1, "<0 1 2 3>/2"))
.sound("supersaw")
.lpf(300)
.adsr("0:0:.5:.1")
.room(roomAmt)
.gain(masterGain)
.postgain(pick(gain_patterns, pattern))

drums:
stack(
  s("tech:5")
  .postgain(6)
  .pcurve(2)
  .pdec(1)
  .struct(pick(drum_structure, pattern)),

  s("sh")
  .struct("[x!3 ~!2 x!10 ~]")
  .postgain(0.5).lpf(7000)
  .bank("RolandTR808")
  .speed(0.8).jux(rev)
  .room(roomAmt)
  .gain(0.6 * masterGain),

  s("{~ ~ rim ~ cp ~ rim cp ~!2 rim ~ cp ~ < rim ~ >!2}%8 *2")
  .bank("[KorgDDM110, OberheimDmx]")
  .speed(1.2)
  .postgain(.25 * masterGain)
)
.gain(masterGain)

drums2:
stack(
  s("[~ hh]*4")
  .bank("RolandTR808")
  .room(roomAmt)
  .speed(0.75)
  .gain(1.2 * drum2Gain * masterGain),

  s("hh").struct("x*16")
  .bank("RolandTR808")
  .gain(0.6 * drum2Gain)
  .jux(rev)
  .room(roomAmt)
  .postgain(0.5 * drum2Gain),

  s("[psr:[2|5|6|7|8|9|12|24|25]*16]?0.1")
  .gain(0.1 * drum2Gain)
  .postgain(pick(gain_patterns, pattern))
  .hpf(1000)
  .speed(0.5)
  .rarely(jux(rev))
)
.gain(masterGain * drum2Gain)


// @version 1.3
`;
