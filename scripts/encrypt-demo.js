/*
 * Quick helper to replicate the login password encryption flow.
 * Usage example:
 *   node scripts/encrypt-demo.js --password=123456 --passkeyId=abc123 --publicKeyFile=path/to/public.pem
 * or
 *   node scripts/encrypt-demo.js --password=123456 --passkeyId=abc123 --publicKey="-----BEGIN PUBLIC KEY-----..."
 *
 * If you prefer to avoid passing parameters, fill SAMPLE_CONFIG below and run:
 *   node scripts/encrypt-demo.js
 */
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const md5 = require('js-md5')

const SAMPLE_CONFIG = {
  password: '123456',
  passkeyId: 'dd4e387cad389fe0',
  // Replace the lines below with your actual PEM if you want to bake it in.
  publicKeyLines: [
    '-----BEGIN PUBLIC KEY-----',
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC6ndzIbTOlJ3aJiMrk9PvVL/5JhowZk9/1eyqOtoIEI5Rtl9J6zh5SHp0qWfEl+oHQyVLXjNGGES7LsxeNUMnhpz/jQIjrpU7LFrr5Y2JlfzpfL1v63nICc+Co7QQD5pvTGvqAcwQZtqjsi2mjbQPDWZN8vzp+dzUwTIc5wrMpnQIDAQAB',
    '-----END PUBLIC KEY-----'
  ]
}

function usage() {
  console.log('Usage:')
  console.log('  node scripts/encrypt-demo.js --password=<pwd> --passkeyId=<id> --publicKeyFile=<pem path>')
  console.log('  node scripts/encrypt-demo.js --password=<pwd> --passkeyId=<id> --publicKey="PEM CONTENT"')
  process.exit(1)
}

function parseArgs(argv) {
  return argv.reduce((acc, cur) => {
    const [key, value] = cur.split('=')
    if (!value) {
      return acc
    }
    const cleanKey = key.replace(/^--/, '')
    acc[cleanKey] = value
    return acc
  }, {})
}

function loadPublicKey(options) {
  if (options.publicKey) {
    return options.publicKey.replace(/\\n/g, '\n')
  }

  if (options.publicKeyFile) {
    const absolutePath = path.isAbsolute(options.publicKeyFile)
      ? options.publicKeyFile
      : path.join(process.cwd(), options.publicKeyFile)

    if (!fs.existsSync(absolutePath)) {
      console.error(`Public key file not found: ${absolutePath}`)
      process.exit(1)
    }

    return fs.readFileSync(absolutePath, 'utf8')
  }

  console.error('Public key is required. Provide --publicKey or --publicKeyFile')
  usage()
}

function encryptPassword({ password, passkeyId, publicKey }) {
  const hashed = md5(password)
  const encryptedBuffer = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING
    },
    Buffer.from(hashed)
  )

  const encrypted = encryptedBuffer.toString('base64')
  const payload = `${passkeyId || ''}${encrypted}`

  return { hashed, encrypted, payload }
}

function main() {
  const args = parseArgs(process.argv.slice(2))

  const embeddedPublicKey = (SAMPLE_CONFIG.publicKeyLines || []).join('\n')
  const effectivePassword = args.password || SAMPLE_CONFIG.password
  const effectivePasskeyId = args.passkeyId || SAMPLE_CONFIG.passkeyId
  const effectivePublicKey = args.publicKey || embeddedPublicKey

  if (!effectivePassword || !effectivePasskeyId || !effectivePublicKey.trim()) {
    console.error('Password, passkeyId and publicKey are required. Provide CLI args or set SAMPLE_CONFIG.')
    usage()
  }

  const lookupOptions = {
    ...args,
    publicKey: effectivePublicKey,
    publicKeyFile: args.publicKeyFile
  }

  const publicKey = loadPublicKey(lookupOptions)
  const { hashed, encrypted, payload } = encryptPassword({
    password: effectivePassword,
    passkeyId: effectivePasskeyId,
    publicKey
  })

  console.log('MD5(password):', hashed)
  console.log('RSA encrypted (base64):', encrypted)
  console.log('Final payload (passkeyId + encrypted):', payload)
  console.log('\nCOPY-READY PAYLOAD:')
  console.log(payload)

  const outputPath = path.join(__dirname, 'encrypt-demo-output.txt')
  fs.writeFileSync(outputPath, payload + '\n', 'utf8')
  console.log(`Saved to ${outputPath}`)
}

main()
