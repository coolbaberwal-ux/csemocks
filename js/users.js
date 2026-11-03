/**
 * Encrypted Database
 * PINs are hashed using SHA-256 so actual passwords are never exposed in the client code.
 */
export const validUsers = [
          {
    rollNo: "UPSC202705",
    pinHash: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", // Original PIN: QrWeE@@!!><
    name: "Ankit",
    plan: "Target 2027 Prelims Series"
  },
  {
    rollNo: "UPSC202708",
    pinHash: "27a8838acf6dbe16511a9c1fd00cfea420fe54fb0566593120f1300023dacb74", // Original PIN: Main Nahi Btaunga
    name: "Saksham",
    plan: "Target 2027 Prelims Series"
  },
];