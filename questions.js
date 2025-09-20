// questions.js
// Exports a questions array. Each question is:
// { id, text, axes: { compassX: weight, compassY: weight, values: {Equality: w, Liberty: w, ...} }, reverse: bool }
// Keep axes sparse; a question may affect only a subset.
// Note: For a real deployment expand questions (50-100) with careful phrasing & review.

export const QUESTIONS = [
  // Economic: left(-) vs right(+). Social: authoritarian(+)/libertarian(-).
  // compassX -> economic; compassY -> social
  { id: 1, text: "High taxes on the rich are necessary to fund public services.", axes:{compassX:-1, values:{Equality:1}}, reverse:false },
  { id: 2, text: "The government should restrict some types of speech for social harmony.", axes:{compassY:1, values:{Authority:1}}, reverse:false },
  { id: 3, text: "Private enterprises, not the state, usually deliver services better.", axes:{compassX:1, values:{Market:1}}, reverse:false },
  { id: 4, text: "The state should prioritize national security even if that limits some personal freedoms.", axes:{compassY:1, values:{Security:1}}, reverse:false },
  { id: 5, text: "Universal basic healthcare should be provided by the state.", axes:{compassX:-1, values:{Equality:1}}, reverse:false },
  { id: 6, text: "Individuals should be free to make choices even if society disapproves.", axes:{compassY:-1, values:{Liberty:1}}, reverse:false },
  { id: 7, text: "Open borders mostly benefit the rich and harm ordinary citizens.", axes:{compassX:1, values:{Nationalism:1}}, reverse:false },
  { id: 8, text: "The criminal justice system should focus more on rehabilitation than punishment.", axes:{compassY:-1, values:{Humanitarian:1}}, reverse:false },
  { id: 9, text: "Corporations should have minimal regulation.", axes:{compassX:1, values:{Market:1}}, reverse:false },
  { id: 10, text: "A strong central government is better at solving big problems than local communities.", axes:{compassX:-0.5, compassY:0.5, values:{Collectivism:1}}, reverse:false },

  // add more questions... (for demo we include 30-80 in practice)
];

// For production: expand QUESTIONS to 50-80 items, ensure balance across axes,
// include reverse-coded items (reverse:true) to control acquiescence bias.
