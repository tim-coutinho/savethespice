import { auth, provider } from "../utils/firebase";

export const login = setUser => {
  // auth.onAuthStateChanged(user => {
  // if (user) {
  //   setUser(user.uid);
  // } else {
  auth
    .signInWithPopup(provider)
    .then(result => {
      setUser(result.user.uid);
    })
    .catch(error => {
      const { code, message, email, credential } = error;
      console.error("Error:", { code, message, email, credential });
    });
  // }
  // });
};

export const signOut = setUser => {
  auth.signOut();
  setUser("");
};
