import bcrypt from "bcryptjs";

const senha = process.argv[2] || "admin123";
const saltRounds = 10;
const hash = bcrypt.hashSync(senha, saltRounds);

console.log(`\nSenha: ${senha}`);
console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`);

