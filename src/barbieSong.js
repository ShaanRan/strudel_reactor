export const barbie_tune = `
setcps(1.1)

lead = n "g5 fs5 d5 g5 fs5 d5" # sound "square" # gain 1.2

bass = n "g3 g3 d3 d3" # sound "saw" # gain 0.9

chords =
  sound "supersaw"
  * slow 2
  * n "<g4'maj7 d4'maj7 e4'min7 c4'maj7>"
  # gain 0.7

drums =
  (sound "bd*2" # gain 1.1)
  + (sound "sn" # gain 1)
  + (sound "hh*4" # gain 0.6)

lead
  |=| bass
  |=| chords
  |=| drums
`;
