import tls from 'tls';

const email = 'orcamento@medicpe.com.br';
const password = 'Medic@#2024OR'; // Using a password found in the previous file for testing

const socket = tls.connect(993, 'email-ssl.com.br', { rejectUnauthorized: false });

let buffer = '';
let step = 0;

socket.on('data', (data) => {
  const str = data.toString('latin1');
  buffer += str;
  console.log('--- RECEIVED ---');
  console.log(str.substring(0, 1000));
  
  if (step === 0 && buffer.includes('* OK')) {
    step = 1;
    buffer = '';
    socket.write(`A1 LOGIN "${email}" "${password}"\r\n`);
  } else if (step === 1 && buffer.includes('A1 OK')) {
    step = 2;
    buffer = '';
    socket.write('A2 SELECT INBOX\r\n');
  } else if (step === 2 && buffer.includes('A2 OK')) {
    const match = buffer.match(/\* (\d+) EXISTS/);
    if (match) {
      const total = parseInt(match[1]);
      step = 3;
      buffer = '';
      socket.write(`A3 FETCH ${total}:${total} (FLAGS BODY.PEEK[HEADER.FIELDS (FROM TO SUBJECT DATE)] BODY.PEEK[TEXT])\r\n`);
    }
  } else if (step === 3 && buffer.includes('A3 OK')) {
    console.log('--- FINAL BUFFER ---');
    console.log(buffer);
    socket.write('A4 LOGOUT\r\n');
  }
});

socket.on('end', () => console.log('DISCONNECTED'));
socket.on('error', (err) => console.error(err));
