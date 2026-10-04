// Who may do what, in one place (specs/ustadz-profiles, specs/answers).
//
// Answering is for any Guru or Admin. "Ustadz" is narrower: a Guru, or an Admin who is not
// hidden from the ustadz lists. Only the server knows about hiding, so it sends `isUstadz` on
// `me`, on each answer, and on the answerer and author of lists and articles; never work it out
// from `role` here.
export const canAnswer = (person) => person?.role === "Guru" || person?.role === "Admin";

export const isUstadz = (person) => person?.isUstadz === true;
