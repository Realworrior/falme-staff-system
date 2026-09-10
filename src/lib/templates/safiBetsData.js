export const SAFIBETS_DATA = [
  {
    id: 1,
    title: 'CHAT FLOW & ENGAGEMENT',
    description: 'First touchpoint. Acknowledge fast, set a professional tone, get the client talking.',
    subsections: [
      {
        id: '1.1',
        title: 'Client Says Hi / Silent After Auto Greeting',
        triggers: 'hi, hello, hey, greeting',
        variants: [
          {
            label: 'Standard',
            text: "Good day! You've reached SafiBets customer support. Please go ahead and share your query and we'll assist you promptly.",
          },
          {
            label: 'Alt A',
            text: "Hello! SafiBets support is available and ready. Kindly let us know what you need assistance with.",
          },
          {
            label: 'Alt B',
            text: "Good day! Welcome to SafiBets. Please share the details of your concern and we'll take it from here.",
          },
          {
            label: 'Alt C',
            text: "Hello! You're connected to SafiBets support. Please describe your issue and we'll attend to it right away.",
          },
          {
            label: 'High Empathy',
            text: "Hello! Whatever you're dealing with, our team is here to help. Please share what happened and we'll work through it with you.",
          },
        ],
      },
      {
        id: '1.2',
        title: "Client Is Vague - 'Help' / 'Problem'",
        triggers: 'help, problem, issue, vague',
        variants: [
          {
            label: 'Standard',
            text: "Hello! To assist you efficiently, please provide your registered phone number along with a brief description of your concern and we'll address it immediately.",
          },
          {
            label: 'Alt A',
            text: "Hi! Our support team is ready. Kindly share your registered phone number and explain the issue so we can begin right away.",
          },
          {
            label: 'Alt B',
            text: "Hello! Please send your account phone number and outline the problem so we can investigate and assist you without delay.",
          },
          {
            label: 'Alt C',
            text: "Hi! We're here to help. Kindly provide your phone number and describe what's happening so we can look into it immediately.",
          },
        ],
      },
      {
        id: '1.3',
        title: "Client Jumps Straight to Urgency - 'Where Is My Money'",
        triggers: 'where is my money, money, withdrawal, urgent, funds',
        variants: [
          {
            label: 'Standard',
            text: "We'll look into this immediately. Kindly provide your registered phone number, the amount in question, and the exact time of the transaction so we can investigate.",
          },
          {
            label: 'Alt A',
            text: "Understood, we're prioritizing this. Please share your phone number, the amount, and the exact transaction time and we'll attend to your case right away.",
          },
          {
            label: 'Alt B',
            text: "We're treating this as urgent. Kindly send your phone number, the amount, and the time of the transaction and we'll revert without delay.",
          },
          {
            label: 'High Empathy',
            text: "We understand your concern and we'll act on this right away. Please share your registered number, the amount, and the exact time and we'll get on it immediately.",
          },
        ],
      },
      {
        id: '1.4',
        title: 'Insults / Aggression',
        triggers: 'stupid, useless, fraud, scam, thieves, steal, angry, abuse',
        variants: [
          {
            label: 'Standard',
            text: "We understand your frustration and our team is committed to resolving this for you. Kindly maintain respectful communication so we can assist you to the best of our ability. Please share what happened.",
          },
          {
            label: 'Alt A',
            text: "We're here to help and your concern is important to us. Please describe the issue in a calm manner so we can work on resolving it promptly.",
          },
          {
            label: 'Alt B',
            text: "We recognise this situation is frustrating and we want to resolve it. Please outline what happened and we will do our utmost to assist.",
          },
          {
            label: 'Firm Boundary',
            text: "We are committed to helping you and will do everything within our power to resolve this. However, we do require respectful communication to proceed effectively. Please share your concern and we'll address it right away.",
          },
          {
            label: 'High Empathy',
            text: "We hear you and we understand this is difficult. Please let us know what happened and we'll work through it together. Keeping the conversation respectful helps us give you our full attention.",
          },
        ],
      },
      {
        id: '1.5',
        title: 'Closing Statement',
        triggers: 'thanks, bye, resolved, okay, done, goodbye',
        variants: [
          {
            label: 'Standard',
            text: "Thank you for contacting SafiBets. We're pleased your issue has been resolved. Please don't hesitate to reach out whenever you require assistance.",
          },
          {
            label: 'Alt A',
            text: "All resolved. Thank you for your patience. SafiBets support is always available when you need us.",
          },
          {
            label: 'Alt B',
            text: "Glad we could assist. Your account is in order. Feel free to contact us at any time.",
          },
          {
            label: 'Alt C',
            text: "Your issue is fully resolved. Thank you for reaching out. The SafiBets support team is always here for you.",
          },
          {
            label: 'High Empathy',
            text: "We truly appreciate your patience throughout this process. We're glad everything is sorted. Take care and enjoy the game.",
          },
        ],
      },
      {
        id: '1.6',
        title: 'Direct Client to Live Support Chat',
        triggers: 'live support, chat link, blastchat, talk to agent, direct support',
        variants: [
          {
            label: 'Standard',
            text: "You may reach our live support team directly at any time via https://blastchat.chat/chat/safibets. An agent is available to assist you immediately.",
          },
          {
            label: 'Alt A',
            text: "To connect directly with a SafiBets support agent, please visit https://blastchat.chat/chat/safibets. Our team will be ready to assist you promptly.",
          },
          {
            label: 'High Empathy',
            text: "We want to get this resolved for you as quickly as possible. Please connect directly with our live support team via https://blastchat.chat/chat/safibets and we'll take care of you right away.",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'DEPOSITS',
    description: 'M-PESA only. Identify deposit type first. Check for mini-statements, Airtel, and Paybills.',
    subsections: [
      {
        id: '2.1A',
        title: 'Failed Deposit - 10-Character M-PESA Code Required',
        triggers: 'deposit failed, not reflected, not showing, deposited, funds not showing, mpesa code, 10 digit, 10 character',
        variants: [
          {
            label: 'Standard',
            text: "We regret that your deposit has not reflected. We'll resolve this promptly. Kindly provide your registered phone number, the amount deposited, and the 10-character M-PESA transaction code from your SMS, for example UC8U77YY7Q. Please share the code as text rather than a screenshot, and note that mini-statement codes are not accepted.",
          },
          {
            label: 'Alt A',
            text: "Not to worry, we'll get this sorted for you. Please share your registered phone number, the deposit amount, and the 10-character M-PESA code (e.g. UC8U77YY7Q) as plain text rather than a screenshot. We'll verify and update your balance without delay.",
          },
          {
            label: 'Alt B',
            text: "To trace and credit your deposit, please provide three details: your registered phone number, the deposited amount, and the 10-character M-PESA code from your SMS (e.g. UC8U77YY7Q). Please share as plain text, not as a screenshot.",
          },
          {
            label: 'High Empathy',
            text: "We understand how concerning a delayed deposit can be and we want to resolve this for you immediately. Please share the phone number used to deposit, the exact amount, and the 10-character M-PESA code from your SMS (for example UC8U77YY7Q). Text only please, and we'll look into this right away.",
          },
        ],
      },
      {
        id: '2.1B',
        title: 'Failed Deposit - Full M-PESA Message Required',
        triggers: 'full message, full sms, mpesa confirmation message, complete sms, paste message, copy sms',
        variants: [
          {
            label: 'Standard',
            text: "To verify and credit your deposit promptly, please copy and paste the full M-PESA confirmation SMS, for example: 'UC8U77YY7Q Confirmed. Ksh276.00 transferred to SAFIBETS LIMITED for account 0712345678 on 8/3/26 at 1:15 AM.' Please share it as text, not a screenshot.",
          },
          {
            label: 'Alt A',
            text: "Kindly copy and paste the complete M-PESA confirmation SMS as text, for example: 'UC8U77YY7Q Confirmed. Ksh276.00 transferred to SAFIBETS LIMITED for account 0712345678 on 8/3/26 at 1:15 AM.' Once we receive the full message, we will verify the details and update your balance without delay.",
          },
          {
            label: 'High Empathy',
            text: "We would like to update your balance as quickly as possible. Please copy your entire M-PESA confirmation message and paste it in this chat (e.g. 'UC8U77YY7Q Confirmed. Ksh276.00 transferred to SAFIBETS LIMITED for account 0712345678 on 8/3/26 at 1:15 AM.'). The full message text allows us to confirm and credit your account immediately.",
          },
        ],
      },
      {
        id: '2.2',
        title: 'Why Screenshots Are Not Accepted (Text Only Rule)',
        triggers: 'screenshot, why text only, why no screenshot, image of receipt, photo of message, cannot copy screenshot',
        variants: [
          {
            label: 'Standard',
            text: "Kindly share the transaction details as text rather than a screenshot. Text within screenshots cannot be directly extracted, creating a risk of errors when manually transcribing characters that appear similar, such as number 1 and letter I, or number 0 and letter O. Sharing the code or message as text enables us to verify your deposit instantly and accurately.",
          },
          {
            label: 'Alt A',
            text: "We request that you copy and paste the text from your SMS rather than sending a screenshot image. Screenshots cannot be directly used in our system and manual entry often leads to confusion between similar characters such as 1 and I, or 0 and O. Submitting text ensures swift and accurate verification.",
          },
          {
            label: 'High Empathy',
            text: "We understand that sending a screenshot feels more convenient, but it can lead to delays when characters like O and 0, or I and 1, are confused during manual entry. Pasting the actual text from your SMS allows us to verify and credit your account without any errors or unnecessary delays.",
          },
        ],
      },
      {
        id: '2.3',
        title: 'Why Mini-Statements Are Not Accepted (Client Shares Mini-Statement)',
        triggers: 'mini statement, last 5 transactions, why mini statement not accepted, statement code, combined code, mini-statement',
        variants: [
          {
            label: 'Standard',
            text: "Kindly note that mini-statement codes are not accepted for deposit verification. When a mini-statement is requested, M-PESA generates a single batch code covering your last 5 transactions, rather than the unique code for this specific deposit. We require the individual 10-character code from the actual deposit confirmation SMS, for example UC8U77YY7Q.",
          },
          {
            label: 'Alt A',
            text: "The code you have provided appears to be a mini-statement reference. Safaricom issues one 10-digit code for the entire mini-statement covering the last 5 transactions, which cannot be matched to individual deposits in our system. Kindly locate the specific deposit SMS and share the 10-character transaction code from that message (e.g. UC8U77YY7Q) as text.",
          },
          {
            label: 'High Empathy',
            text: "This is a common and understandable mix-up. Mini-statement codes consolidate your last 5 transactions under a single M-PESA batch reference, which cannot be matched to a specific deposit by our system. We require the unique 10-character code from the specific payment confirmation SMS you received (for example UC8U77YY7Q). Please share that and we will credit your balance immediately.",
          },
        ],
      },
      {
        id: '2.4',
        title: 'Deleted M-PESA Message - How to Recover',
        triggers: "deleted mpesa, deleted message, can't find code, no sms, lost message",
        variants: [
          {
            label: 'Standard',
            text: "That is not a problem. You may recover the transaction code through two methods: open your M-PESA app and review your transaction history for the specific 10-character code, or contact Safaricom directly on 100 to request a full official M-PESA statement. Kindly note that mini-statement codes covering the last 5 transactions are not accepted.",
          },
          {
            label: 'Alt A',
            text: "You can retrieve the code from your M-PESA app under transaction history, or by contacting Safaricom on 100 for a full statement. Please note that mini-statement codes are not valid for individual deposit verification.",
          },
        ],
      },
      {
        id: '2.4B',
        title: 'Client Self-Check - Deposit Unsuccessful Option',
        triggers: 'how to check, deposit unsuccessful, verify code, footer',
        variants: [
          {
            label: 'Standard',
            text: "You may also verify your deposit directly via the SafiBets platform. Open your account, scroll to the footer, select 'Deposit Unsuccessful?', and enter the 10-character M-PESA code from your SMS, for example SJ82KFNAX4. This provides an immediate status update.",
          },
          {
            label: 'Alt',
            text: "There is a self-verification option available within the platform. Navigate to your account, scroll to the footer, tap 'Deposit Unsuccessful?', and enter the 10-character code from your deposit SMS. You will receive an instant update on the status.",
          },
        ],
      },
      {
        id: '2.5',
        title: '❌ Bonga Points Deposit - Not Supported',
        triggers: 'bonga points, bonga deposit, safaricom points, paid with bonga',
        variants: [
          {
            label: 'Standard',
            text: "We regret to inform you that SafiBets does not support Bonga Points deposits. Each account is linked exclusively to one registered M-PESA number and our system cannot credit payments made via Bonga Points. To recover your funds, please contact Safaricom directly by calling 100 or sending a WhatsApp message to 0722000100 to request a reversal. Once the funds are returned, you may deposit using your registered M-PESA number.",
          },
          {
            label: 'Alt A',
            text: "Bonga Points are not an accepted deposit method on our platform. Our system exclusively processes standard M-PESA transactions linked to your registered number and is unable to credit Bonga Point payments. To recover your funds, please contact Safaricom on 100 or via WhatsApp at 0722000100 to initiate a reversal.",
          },
          {
            label: 'High Empathy',
            text: "We sincerely apologize for the inconvenience. Unfortunately Bonga Points cannot be used to fund your SafiBets account as we only accept standard M-PESA deposits from your registered number. Kindly contact Safaricom as soon as possible on 100 or WhatsApp 0722000100 to reverse the payment. Once your funds are returned, please re-deposit via M-PESA and we will assist from there.",
          },
          {
            label: 'Plain Language',
            text: "Bonga Points are not accepted here. We only process standard M-PESA payments from the phone number registered to your account. Kindly call Safaricom on 100 or WhatsApp 0722000100 to recover your funds. Once the reversal is complete, please deposit using your regular M-PESA.",
          },
        ],
      },
      {
        id: '2.6',
        title: '❌ Airtel Money Deposit - Not Supported',
        triggers: 'airtel money, airtel deposit, airtel payment, airtel not working, paid with airtel',
        variants: [
          {
            label: 'Standard',
            text: "We regret that Airtel Money is not a supported deposit method on SafiBets. Our platform exclusively processes M-PESA payments from your registered number and is unable to credit Airtel Money transactions. To recover your funds, please contact Airtel immediately by calling 100 or emailing airtelmoney@airtel.com to initiate a reversal. Once received, please deposit using your registered M-PESA number.",
          },
          {
            label: 'Alt A',
            text: "We are sorry, but Airtel Money deposits are not accepted on SafiBets. Our platform only supports M-PESA from your registered number and Airtel Money payments cannot be credited to your account. To recover your funds, please contact Airtel on 100 or email airtelmoney@airtel.com to request a reversal, then re-deposit via M-PESA.",
          },
          {
            label: 'High Empathy',
            text: "We understand this is a frustrating situation and we want to help you recover your funds as quickly as possible. Airtel Money is not supported on SafiBets and the payment cannot be credited to your account. Please contact Airtel immediately on 100 or email airtelmoney@airtel.com to request a reversal. Once completed, you may deposit via M-PESA and we will assist you from there.",
          },
          {
            label: 'Plain Language',
            text: "Airtel Money is not accepted on SafiBets. We only process M-PESA from your registered phone number. Please call Airtel on 100 or email airtelmoney@airtel.com to reverse your payment. Once reversed, deposit again using M-PESA.",
          },
        ],
      },
      {
        id: '2.7',
        title: '❌ Unsupported M-PESA Merchant Transaction (Paybill/Till by Mistake)',
        triggers: 'paybill, till number, merchant, wrong deposit, reversal, paid by mistake, wrong number, unregistered number',
        variants: [
          {
            label: 'Standard',
            text: "Kindly note that SafiBets is unable to manually reverse payments made to our Paybill or Till, or deposits originating from a number not registered to your account. Our system exclusively accepts M-PESA payments from the specific number linked to your account. Please initiate a reversal with Safaricom immediately by forwarding your payment SMS to 457 or by calling Safaricom on 100.",
          },
          {
            label: 'Alt A',
            text: "We are unable to manually process or reverse payments made to our Paybill or Till from an unregistered number. Your account is associated with one specific M-PESA line and only transactions from that number are accepted. Please contact Safaricom promptly to initiate a reversal by forwarding the payment SMS to 457 or calling 100.",
          },
          {
            label: 'High Empathy',
            text: "We understand this is a stressful situation and we sincerely regret the inconvenience. Unfortunately SafiBets cannot process or reverse payments made to our Paybill or Till from an unregistered number. Our system only accepts M-PESA from the exact number linked to your account. Please contact Safaricom as soon as possible to request a reversal by forwarding your payment SMS to 457 or calling 100.",
          },
          {
            label: 'Plain Language',
            text: "Your deposit did not go through because it was made from a number not linked to your SafiBets account, or was sent to our Paybill or Till. Our system only accepts M-PESA from your registered number and we cannot reverse this on our end. Please contact Safaricom immediately: forward the M-PESA SMS to 457, call 100, or reverse it via the MySafaricom App.",
          },
        ],
      },
      {
        id: '2.8',
        title: 'M-PESA Network Delay Notice',
        triggers: 'network delay, safaricom issue, temporary delay, safe',
        variants: [
          {
            label: 'Standard',
            text: "We want to assure you that your funds are secure. We are currently aware of a temporary delay on the Safaricom network affecting some M-PESA deposits. This is not a SafiBets issue and all deposits will reflect automatically once the network is fully restored. We appreciate your patience.",
          },
          {
            label: 'Alt A',
            text: "Your funds are safe and fully accounted for. There is currently a temporary delay on Safaricom's network affecting some deposits. Everything will reflect automatically once service is restored. We are monitoring the situation closely.",
          },
          {
            label: 'High Empathy',
            text: "We fully understand the anxiety a delayed deposit can cause and we want to assure you that your money is safe. The delay is on Safaricom's end, not with SafiBets. Your funds will reflect automatically once the network is restored. We sincerely appreciate your patience.",
          },
        ],
      },
      {
        id: '2.9',
        title: 'General M-PESA Deposit Delay',
        triggers: 'mpesa deposit delay, not reflected yet, stuck',
        variants: [
          {
            label: 'Standard',
            text: "We apologize for the delay. We are currently experiencing some slowness with M-PESA deposits. Please share your registered phone number and the M-PESA transaction code from your SMS and we will manually verify and update your balance immediately.",
          },
          {
            label: 'High Empathy',
            text: "We sincerely apologize for the inconvenience and we understand your frustration. M-PESA is experiencing minor delays at this time. Kindly send your phone number and the M-PESA transaction code and we will update your balance straight away.",
          },
        ],
      },
      {
        id: '2.10',
        title: 'Why Bonga, Airtel & Merchant Deposits Are Not Credited (Explainer)',
        triggers: 'why not credited, how does deposit work, why failed deposit, account number linked, deposit not working bonga airtel paybill',
        variants: [
          {
            label: 'Standard',
            text: "Your SafiBets account is linked exclusively to one registered M-PESA number. Our system can only credit deposits made directly from that specific number. Payments via Bonga Points, Airtel Money, or through our Paybill or Till from a different number are not recognised by our system and cannot be credited to your account. This is why manual addition of such funds is not possible.",
          },
          {
            label: 'Plain Language',
            text: "Your SafiBets account is connected to one M-PESA number, the one you registered with. Our system verifies every deposit and only accepts money from that exact number. Bonga Points, Airtel Money, or payments to our Paybill or Till from a different number cannot be processed. In all cases, you will need to reverse the payment and re-deposit using your registered M-PESA number.",
          },
          {
            label: 'Alt A',
            text: "Every SafiBets account is tied to a single registered M-PESA number and our system only credits deposits from that number. Bonga Points and Airtel Money are alternative payment systems that our platform does not recognise. Payments made to our Paybill or Till from an unregistered number will also not reflect. In each case, you must reverse the payment and re-deposit through your registered M-PESA number.",
          },
        ],
      },
      {
        id: '2.11',
        title: 'Deposit Made from Unregistered Number (Register New Line Advice)',
        triggers: 'unregistered number, deposited with different number, deposited from another line, wrong sim deposit, sent money from someone else phone',
        variants: [
          {
            label: 'Standard',
            text: "Your SafiBets account is linked exclusively to one M-PESA number, being the number you registered with. Our system can only credit deposits originating from that specific number. As the deposit was made from an unregistered line, the funds cannot be automatically applied to your current account. To resolve this, kindly create a new SafiBets account using the phone number that made the deposit. Once registered, please share the M-PESA confirmation message with us and we will verify and credit your balance promptly.",
          },
          {
            label: 'Alt A',
            text: "Our system exclusively credits deposits from the phone number registered to your SafiBets account. Since the deposit was made from a different number, the funds cannot be applied to your existing profile. We recommend registering a new SafiBets account with the number that made the payment. Once registered, send us the full M-PESA confirmation SMS and we will verify and credit your balance without delay.",
          },
          {
            label: 'High Empathy',
            text: "We completely understand your concern and we are here to assist you in getting your funds credited correctly. Each SafiBets account is linked to one specific M-PESA number, so payments from an unregistered number cannot be automatically credited. The most straightforward resolution is to register a SafiBets account using the exact phone number the deposit was made from. After completing registration, please share the M-PESA payment SMS with us and we will promptly verify and credit your account.",
          },
          {
            label: 'Plain Language',
            text: "Your SafiBets account is linked to your specific registered number only. If the deposit was made from a different SIM or someone else's number, our system cannot apply it to your current account. To access those funds, register a new SafiBets account with the phone number that made the payment. Once registered, paste the M-PESA confirmation message here and we will verify and confirm your funds immediately.",
          },
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'WITHDRAWALS',
    description: 'Pending withdrawals, failed transfers, minimum amounts, and batch limits.',
    subsections: [
      {
        id: '3.1',
        title: 'Withdrawal Not Received - Requesting Details',
        triggers: 'withdrawal not received, sent but not arrived, money not received',
        variants: [
          {
            label: 'Standard',
            text: "We appreciate you reaching out and we will trace this immediately. Kindly provide your registered phone number, the withdrawal amount, and the precise time you submitted the request.",
          },
          {
            label: 'Alt A',
            text: "We're on this right away. Please send your phone number, the withdrawal amount, and the exact time of the request and we will investigate without delay.",
          },
          {
            label: 'Alt B',
            text: "To trace your withdrawal, we will need three details from you: your phone number, the amount withdrawn, and the exact time of the request. Please send those and we'll act immediately.",
          },
          {
            label: 'High Empathy',
            text: "We understand your concern and we will act on this immediately. Kindly share your registered phone number, the amount, and the exact time of the withdrawal and we will follow up right away.",
          },
        ],
      },
      {
        id: '3.2',
        title: 'Withdrawal Delayed - Over 30 Minutes',
        triggers: 'delayed, processing, 30 minutes, waiting, still pending',
        variants: [
          {
            label: 'Standard',
            text: "Withdrawals are typically processed within minutes. If yours has been pending for over 30 minutes, kindly share your phone number, the amount, and the exact time of the request so we may escalate this immediately.",
          },
          {
            label: 'High Empathy',
            text: "We understand the frustration of waiting for a withdrawal and we sincerely apologize for the delay. If it has been over 30 minutes, please send your phone number, the amount, and the time of the request and we will treat this as a priority.",
          },
        ],
      },
      {
        id: '3.3',
        title: 'Withdrawal Failed - Funds Not Received',
        triggers: 'failed withdrawal, not received, transaction failed, withdraw failed',
        variants: [
          {
            label: 'Standard',
            text: "We regret to hear that. To investigate this, please first confirm that your M-PESA number is registered and active, then share your phone number, the withdrawal amount, and the exact time of the request and we will investigate immediately.",
          },
          {
            label: 'High Empathy',
            text: "We completely understand your concern and we will investigate this thoroughly. Please first confirm your M-PESA line is active, then share your phone number, the amount, and the exact time. We will trace this right away.",
          },
        ],
      },
      {
        id: '3.4',
        title: 'Unable to Withdraw - Account Check Required',
        triggers: "can't withdraw, withdrawal blocked, not able to withdraw, suspended",
        variants: [
          {
            label: 'Standard',
            text: "We regret that you are experiencing difficulty withdrawing. Please share your registered phone number so we may review your account status and work on restoring withdrawal access promptly.",
          },
          {
            label: 'Alt A',
            text: "There may be a restriction on your account. Kindly provide your registered phone number and we will review the status immediately and assist from there.",
          },
          {
            label: 'High Empathy',
            text: "We understand how frustrating this can be and we want to resolve it for you. Please share your registered phone number so we may review the situation and work on restoring your withdrawal access as quickly as possible.",
          },
        ],
      },
      {
        id: '3.5',
        title: 'Withdrawal Limit - KSh 100,000 Batch Cap',
        triggers: '100k, 100,000, large withdrawal, batch, big withdrawal, delayed large amount',
        variants: [
          {
            label: 'Standard',
            text: "We appreciate your patience. Please note that withdrawals exceeding KSh 100,000 are processed in batches within our system, which may cause a slight delay compared to standard withdrawals. To avoid this in future, we recommend splitting large withdrawals into amounts of KSh 100,000 or below. Your funds are secure and will reflect once the batch is processed.",
          },
          {
            label: 'Alt A',
            text: "Our system processes withdrawals above KSh 100,000 in batches, which can take slightly longer than standard withdrawals. Your funds are secure and will reflect once the batch clears. To avoid future delays, we suggest withdrawing in increments below KSh 100,000.",
          },
          {
            label: 'High Empathy',
            text: "We understand that waiting on a large withdrawal can be stressful and we want to reassure you that your funds are safe. Amounts above KSh 100,000 are processed in batches on our system and may take slightly longer. Your funds will reflect once the batch is cleared. Going forward, splitting into amounts below KSh 100,000 will ensure faster processing.",
          },
        ],
      },
      {
        id: '3.6',
        title: 'First Withdrawal - Referral Bonus Rule (KSh 250)',
        triggers: 'withdraw limit, 250, bonus withdraw, first withdrawal, threshold',
        variants: [
          {
            label: 'Standard',
            text: "Please note that the KSh 250 minimum applies exclusively to the first withdrawal where referral bonuses are used without a prior deposit. Once that initial withdrawal has been processed, the minimum is reduced to KSh 50 for all subsequent withdrawals.",
          },
          {
            label: 'Alt A',
            text: "Your first referral bonus withdrawal requires a minimum balance of KSh 250. Once that first withdrawal is completed, the threshold reduces to KSh 50 for all future withdrawals.",
          },
          {
            label: 'Impatient Client',
            text: "Almost there. Once your balance reaches KSh 250, your withdrawal will become available immediately. Continue playing or top up and you will get there.",
          },
          {
            label: 'Firm / Policy',
            text: "We appreciate your patience with this. The KSh 250 threshold applies to first-time referral bonus withdrawals in accordance with our policy. Once that threshold is cleared, the minimum drops to KSh 50 for all subsequent withdrawals.",
          },
        ],
      },
      {
        id: '3.7',
        title: 'Balance Below KSh 50',
        triggers: 'below 50, minimum withdrawal, balance too low',
        variants: [
          {
            label: 'Standard',
            text: "Your current balance is below the KSh 50 minimum withdrawal threshold. Kindly top up or continue playing until you reach that amount to proceed with a withdrawal.",
          },
          {
            label: 'Alt',
            text: "Withdrawals require a minimum balance of KSh 50. Once you reach that amount, you may proceed with your withdrawal immediately.",
          },
        ],
      },
      {
        id: '3.8',
        title: 'Client Eligible to Withdraw',
        triggers: 'eligible, can withdraw, proceed, confirmed',
        variants: [
          {
            label: 'Standard',
            text: "Good news. Your account is eligible for withdrawal. You may proceed at your convenience.",
          },
          {
            label: 'Alt A',
            text: "Great news. Everything has been verified and you may proceed with your withdrawal whenever you are ready.",
          },
          {
            label: 'Alt B - Retention',
            text: "You are fully eligible to withdraw. Feel free to proceed or continue playing if you prefer. The choice is yours.",
          },
        ],
      },
      {
        id: '3.9',
        title: 'M-PESA Withdrawal Delay - System Notice',
        triggers: 'mpesa withdrawal delay, pending funds, mpesa down',
        variants: [
          {
            label: 'Standard',
            text: "We apologize for the inconvenience. We are currently experiencing delays with M-PESA withdrawals. Our technical team is actively working with the provider to resolve this as quickly as possible. We appreciate your patience.",
          },
          {
            label: 'Alt A',
            text: "We sincerely apologize for the inconvenience. There are currently delays affecting M-PESA withdrawals. Our team is coordinating with the provider to restore full service as quickly as possible. Your funds are secure and we appreciate your patience.",
          },
          {
            label: 'High Empathy',
            text: "We fully understand how frustrating a withdrawal delay can be and we sincerely apologize. Our team is actively working on restoring normal processing speeds as quickly as possible. Thank you very much for your patience and continued trust in SafiBets.",
          },
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'IN-GAME TECHNICAL ISSUES',
    description: 'Crash games (Aviator, JetX), virtual games, missing rounds, and wallet credits.',
    subsections: [
      {
        id: '4.1',
        title: 'Lost Stake - Error During Crash Game',
        triggers: 'something went wrong, rejected bet, stake lost, error, crash error',
        variants: [
          {
            label: 'Standard',
            text: "We regret that this occurred and we will investigate immediately. To review accurately, kindly share your registered phone number, the specific crash game, the exact amount lost per round, and the exact time the error occurred. Please list each round individually without combining amounts.",
          },
          {
            label: 'Alt A',
            text: "We will review this for you right away. Please provide your phone number, the crash game name, the amount lost per round, and the exact time of the error. Each round must be reported individually.",
          },
          {
            label: 'High Empathy',
            text: "We understand how distressing an unexpected error during gameplay can be and we take this matter seriously. Please share your phone number, the specific crash game, the amount lost per round, and the exact time. List each round separately and we will investigate immediately.",
          },
        ],
      },
      {
        id: '4.2',
        title: 'Cashout Won - Winnings Not Added to Wallet (Crash Game)',
        triggers: 'cashout not received, winnings not added, won but not credited, crash win missing',
        variants: [
          {
            label: 'Standard',
            text: "We will verify this for you immediately. Kindly share your registered phone number, a screenshot from your Bet History showing the winning round, the exact time of the cashout, and the amount won.",
          },
          {
            label: 'Alt A',
            text: "Let us resolve this without delay. Please provide your phone number, a Bet History screenshot with the winning round visible, the cashout time, and the amount won.",
          },
          {
            label: 'High Empathy',
            text: "We understand your concern and we want to ensure those winnings are credited to your wallet. Please share your phone number, a screenshot from your Bet History showing the winning round, the cashout time, and the amount. We will resolve this as quickly as possible.",
          },
        ],
      },
      {
        id: '4.3',
        title: 'Global Crash Game / Aviator Down',
        triggers: 'aviator down, crash down, jetx down, game unavailable, broken, global',
        variants: [
          {
            label: 'Standard',
            text: "We apologize for the disruption. The game is currently unavailable globally due to a technical issue on the provider's side. We are monitoring the situation and access will be restored as soon as the provider resolves it. Thank you for your patience.",
          },
          {
            label: 'High Empathy',
            text: "We sincerely apologize for this disruption and we appreciate your patience. The game is currently unavailable for all players due to a technical issue on the provider's side. We are in contact with the provider and will restore access as quickly as possible.",
          },
        ],
      },
      {
        id: '4.4',
        title: 'Lost Stake - Error During Virtual Game',
        triggers: 'virtual game error, something went wrong, stake lost, virtual sports',
        variants: [
          {
            label: 'Standard',
            text: "We regret to hear this and will investigate immediately. Please provide your registered phone number, the virtual game you were playing, the exact amount lost per round, and the exact time the error occurred. Please list each round individually.",
          },
          {
            label: 'Alt A',
            text: "We will review this for you. Please send your phone number, the virtual game name, the amount lost, and the exact time of the error. List each round separately and do not combine amounts.",
          },
          {
            label: 'High Empathy',
            text: "We understand how upsetting an unexpected loss during a game can be. Please share your phone number, the virtual game name, the amount lost per round, and the exact time and we will investigate promptly.",
          },
        ],
      },
      {
        id: '4.5',
        title: 'Winnings Not Added to Wallet - Virtual Game',
        triggers: 'won virtual, winnings not credited, virtual cashout, win not showing',
        variants: [
          {
            label: 'Standard',
            text: "We will resolve this for you promptly. Kindly share your registered phone number, a screenshot from your Bet History showing the winning round, the exact time, and the amount won.",
          },
          {
            label: 'High Empathy',
            text: "Congratulations on your win and we will ensure those funds are credited to your wallet without delay. Please send your phone number, a screenshot from your Bet History with the winning round visible, the time, and the amount.",
          },
        ],
      },
      {
        id: '4.6',
        title: 'Transaction was completed',
        triggers: 'transaction completed, settled correctly, already credited, check transactions, cashout settled, winnings updated',
        variants: [
          {
            label: 'Standard',
            text: "Following a review of your account and gameplay logs, we have confirmed that the cashout and winnings for the round in question were settled and credited correctly to your balance at the time of play. We kindly advise you to recheck your transaction history and account balance logs for the relevant timeframe.",
          },
          {
            label: 'Alt A',
            text: "We have completed a thorough review of your gaming session logs. The transaction was processed successfully and your winnings were credited directly to your wallet at the time of play. Kindly review your transaction history to confirm.",
          },
          {
            label: 'High Empathy',
            text: "We appreciate your patience while we reviewed this. After carefully examining your full gaming logs, we can confirm that your cashout was settled correctly and credited to your wallet in real time during your session. We kindly advise you to recheck your transaction history for that period.",
          },
        ],
      },
    ],
  },
  {
    id: 5,
    title: 'SPORTS BETTING',
    description: 'Betslips, odds changes, voided matches, postponed fixtures, and cashouts.',
    subsections: [
      {
        id: '5.1',
        title: 'Unpaid or Wrongly Settled Winning Bet',
        triggers: 'winning bet, not paid, unpaid, won, wrong settlement, wrongly settled',
        variants: [
          {
            label: 'Standard',
            text: "We will investigate this right away. Kindly provide your registered phone number and the Bet ID, for example #678534. A screenshot of the betslip would also be helpful if available.",
          },
          {
            label: 'Alt A',
            text: "We're on it. Please send your phone number and Bet ID (e.g. #678534). Please attach a betslip screenshot if available and we will review without delay.",
          },
          {
            label: 'High Empathy',
            text: "We understand your concern and we will act on this without delay. Please share your phone number and Bet ID. A screenshot is appreciated but not mandatory. We will review everything immediately.",
          },
        ],
      },
      {
        id: '5.2',
        title: 'Pending Betslip - Postponed Game',
        triggers: 'postponed, cancelled match, not played, match not settled, betslip pending',
        variants: [
          {
            label: 'Standard',
            text: "There is no cause for concern here. Postponed matches typically take up to 48 hours following the original scheduled time for bookmakers to formally settle. Your betslip will update automatically once settled and no action is required on your end.",
          },
          {
            label: 'Alt A',
            text: "Betslips for postponed matches are settled by the bookmaker within 48 hours of the original kick-off time. Your betslip will update automatically. Kindly allow that time to pass.",
          },
          {
            label: 'High Empathy',
            text: "We understand the wait can be frustrating, particularly when you are anticipating an outcome. Postponed matches are settled by bookmakers within 48 hours of the original scheduled time and your betslip will update automatically. We will be here if anything changes.",
          },
        ],
      },
      {
        id: '5.3',
        title: 'Voided Bet - Placed After Match Started',
        triggers: 'void, voided, match started, already started, irregular, policy',
        variants: [
          {
            label: 'Official Decision',
            text: "Following a thorough investigation by our Technical and Risk Management teams, we have confirmed that the bet in question was placed after the match had already commenced. Under our betting rules and T&Cs, all wagers must be placed prior to the official kick-off unless the market is specifically designated as in-play. As the event had already started when the bet was submitted, the betslip has been identified as irregular and has been voided. This decision is final.",
          },
          {
            label: 'Shorter Version',
            text: "Following a full review, it has been confirmed that this bet was placed after the match had already kicked off. In accordance with our betting rules, all bets must be placed before kick-off unless it is an in-play market. The bet has been voided and this decision is final.",
          },
          {
            label: 'Empathy Add-On',
            text: "We appreciate your patience with our review process and we understand this may be disappointing. However, the findings confirm the bet was placed after the match commenced, which is outside the scope of our T&Cs. The void decision stands in accordance with platform policy.",
          },
        ],
      },
      {
        id: '5.4',
        title: 'Cash Out Not Processed',
        triggers: 'cash out, cashout failed, not processed, attempted cashout, fluctuations',
        variants: [
          {
            label: 'Standard',
            text: "We will investigate this for you. Please share your phone number, the Bet ID, and the exact time of the cash out attempt so we may review the matter.",
          },
          {
            label: 'System Note',
            text: "Cash out availability can be temporarily suspended during live odds fluctuations or periods of high traffic. If your cash out did not go through, please send your phone number, Bet ID, and the exact time of the attempt so we can investigate.",
          },
          {
            label: 'High Empathy',
            text: "We understand how frustrating this can be, particularly during a live match. Cash outs are highly time-sensitive. Please share your phone number, Bet ID, and the exact time and we will review what happened right away.",
          },
        ],
      },
      {
        id: '5.5',
        title: 'Wrong Odds Applied to Bet',
        triggers: 'wrong odds, different odds, changed odds, odds recorded',
        variants: [
          {
            label: 'Standard',
            text: "Odds are fixed at the precise moment of submission and may shift right up until that point. Kindly share your phone number and Bet ID so we can retrieve the exact odds recorded at submission.",
          },
          {
            label: 'High Empathy',
            text: "We understand this can be confusing and we are happy to clarify. Odds are locked at the exact moment you submit your bet. Kindly share your phone number and Bet ID and we will retrieve precisely what was recorded.",
          },
        ],
      },
      {
        id: '5.6',
        title: 'Bet Not Accepted / Rejected',
        triggers: 'rejected, not accepted, error message, declined, limit',
        variants: [
          {
            label: 'Standard',
            text: "We are sorry that occurred. Bets may be declined for several reasons, including market closure prior to submission, odds fluctuations during loading, or the stake exceeding the market limit. Please share your phone number and a screenshot of the error message so we may investigate.",
          },
          {
            label: 'High Empathy',
            text: "We are sorry your bet was not accepted. This can occur due to odds changes, market closure, or stake limits. Please share your phone number and the error screenshot so we may investigate and advise you accordingly.",
          },
        ],
      },
      {
        id: '5.7',
        title: 'System Upgrade - Live Betting',
        triggers: 'upgrade, live betting, maintenance, upgrading, down, live',
        variants: [
          {
            label: 'Standard',
            text: "We are currently upgrading our live betting feature to enhance your experience. We apologize for the inconvenience and will notify you as soon as it is back online. Thank you for your patience.",
          },
          {
            label: 'High Empathy',
            text: "We are making improvements to our live betting feature to deliver a better experience for you. It will be available again very soon and we genuinely appreciate your patience during this period.",
          },
        ],
      },
    ],
  },
  {
    id: 6,
    title: 'PROMOTIONS & REFERRALS',
    description: 'Promotions, referral earnings, Aviator rains, and promo terms.',
    subsections: [
      {
        id: '6.1',
        title: 'Available Offers - Full List',
        triggers: 'offers, promotions, bonus list, daily cashback, unlimited rains',
        variants: [
          {
            label: 'Standard',
            text: "Thank you for asking. Here is a summary of what SafiBets currently offers: Tax-free bets, 10% daily cashback on losses, Unlimited rains on Aviator, KSh 10 referral bonus, 5% referral income, and a free bet for each eligible referral. Please check the platform regularly for new promotions.",
          },
          {
            label: 'High Empathy',
            text: "We are glad you asked about our offers! SafiBets currently provides the following benefits: Tax-free bets, 10% daily cashback on losses, Unlimited Aviator rains, KSh 10 per referral, 5% referral income, and a free bet for each eligible referral. Stay tuned for more exciting promotions.",
          },
        ],
      },
      {
        id: '6.2',
        title: 'Deposit Bonus Expired',
        triggers: 'bonus expired, ended, fully claimed, limited time',
        variants: [
          {
            label: 'Standard',
            text: "The deposit bonus was a limited-time promotion and has already been fully claimed. Please continue to watch the platform for upcoming promotions, as more offers are on the way.",
          },
          {
            label: 'High Empathy',
            text: "We understand this may be disappointing and we apologize that this offer was missed. The bonus was time-limited and has been fully redeemed. Please watch the platform for upcoming promotions, as more are planned.",
          },
        ],
      },
      {
        id: '6.3',
        title: 'Referral Bonus Not Received',
        triggers: 'referral bonus, not received, unique link, verification, policy',
        variants: [
          {
            label: 'Standard',
            text: "We will verify this for you. Please confirm that your referral registered using your unique link and completed the account verification process. Once both conditions are fulfilled, the bonus is credited automatically. If you would like us to verify, please share your registered phone number and the number of the referred person.",
          },
          {
            label: 'High Empathy',
            text: "We understand this can be frustrating when you are expecting a bonus. Kindly confirm that your referral signed up using your unique link and completed their account verification. The bonus is credited automatically once all criteria are met. If it has not yet reflected, please share your phone number and the referral's number and we will investigate.",
          },
        ],
      },
      {
        id: '6.4',
        title: 'Rain Promotion - Aviator',
        triggers: 'rain, aviator rain, random credits, game chat, active players',
        variants: [
          {
            label: 'Standard',
            text: "Aviator Rains are random promotional credits distributed within the Aviator game chat. They are available to players who are actively participating in the game at the time of the distribution. Rains cannot be manually requested, so simply remain active in the game for your chance to receive one.",
          },
          {
            label: 'High Empathy',
            text: "Rains are an exciting feature we are sure you will enjoy. They are randomly distributed in the Aviator game chat for active players. There is no way to manually request one, so simply stay active and the next rain may be directed your way.",
          },
        ],
      },
    ],
  },
  {
    id: 7,
    title: 'CASHBACK PROGRAMS',
    description: 'Automatic 8:35 PM daily calculation, 10% net loss rule, 20% sports cashback.',
    subsections: [
      {
        id: '7.1',
        title: 'Where Is My Cashback',
        triggers: 'where is cashback, cashback not received, 8:35 PM, calculate',
        variants: [
          {
            label: 'Standard',
            text: "Cashback is calculated automatically and credited to eligible accounts daily at 8:35 PM. If you recorded a net loss during the cashback period, the amount will reflect in your account after that time. No manual request is required.",
          },
          {
            label: 'Alt A',
            text: "Cashback is processed once per day at 8:35 PM. If your deposits exceeded your withdrawals during the period, it will reflect automatically. Please check your balance after 8:35 PM.",
          },
          {
            label: 'Firm / Impatient Client',
            text: "Cashback is not an instant credit. It is calculated once daily at 8:35 PM. If you qualify based on your account activity, it will reflect automatically. No action is required on your end.",
          },
        ],
      },
      {
        id: '7.2',
        title: 'Cashback Not Received - Conditions Not Met',
        triggers: 'no cashback, not met, net loss, withdrawals deposits',
        variants: [
          {
            label: 'Standard',
            text: "Cashback is only issued when your total deposits during the cashback period exceed your total withdrawals, resulting in a net loss. If your withdrawals were equal to or exceeded your deposits, no cashback will be generated. This calculation is fully automated.",
          },
          {
            label: 'Alt A',
            text: "For cashback to be generated, your deposits must exceed your withdrawals within the cashback period. In the absence of a net loss, the system will not produce a cashback entry. The entire process is automated.",
          },
          {
            label: 'Firm',
            text: "No net loss means no cashback. The system calculates this once per day automatically. If your withdrawals matched or exceeded your deposits during the period, no cashback is generated.",
          },
        ],
      },
      {
        id: '7.3',
        title: 'How to Calculate Cashback',
        triggers: 'how to calculate, formula, subtract, example',
        variants: [
          {
            label: 'Standard',
            text: "Here is how cashback is calculated. The window runs from 8:35 PM the previous day to 8:35 PM today. The formula is as follows: Total Deposits minus Total Withdrawals equals Net Loss. Ten percent of Net Loss equals your cashback. For example: Deposit KSh 1,000, Withdraw KSh 600, Net Loss equals KSh 400, Cashback equals KSh 40.",
          },
          {
            label: 'Simple Formula',
            text: "Here is the formula: Deposits minus Withdrawals equals Net Loss. Then 10% of that Net Loss equals your cashback. For example, KSh 1,000 minus KSh 600 equals a KSh 400 net loss, which generates KSh 40 credited to your account at 8:35 PM.",
          },
        ],
      },
      {
        id: '7.4',
        title: 'Will I Get Cashback Today',
        triggers: 'get cashback today, guaranteed, conditions, will I get',
        variants: [
          {
            label: 'Standard',
            text: "You will receive cashback today at 8:35 PM provided your deposits between 9:00 PM yesterday and 8:35 PM today exceeded your withdrawals, resulting in a net loss. The calculation is fully automated and no action is required on your end.",
          },
          {
            label: 'Alt',
            text: "Check your balance at 8:35 PM. If your deposits during the cashback window exceeded your withdrawals, cashback will be generated and credited automatically. If not, no cashback will be issued for that period.",
          },
        ],
      },
      {
        id: '7.5',
        title: 'Daily Cashback Reset Window - 8:30 to 8:40 PM',
        triggers: 'cashback not counted, deposits not included, reset, calculation window, 8:30',
        variants: [
          {
            label: 'Standard',
            text: "Allow us to explain. Our cashback system undergoes a 10-minute reset between 8:30 PM and 8:40 PM daily. Deposits made within that specific window may not be captured in the current 24-hour cycle, as the system requires a clean state to calculate accurately. Deposits made before or after that window are counted as normal.",
          },
          {
            label: 'High Empathy',
            text: "We are glad you raised this. Between 8:30 PM and 8:40 PM, our system performs its daily reset cycle. Deposits made during that 10-minute window may not always be included in the immediate cashback calculation as the system needs a clean baseline to process correctly. All deposits outside that window are counted normally. We appreciate your patience in this regard.",
          },
        ],
      },
      {
        id: '7.6',
        title: 'Sports Cashback - 20%',
        triggers: 'sports cashback, 20%, lost sports bets, automatic',
        variants: [
          {
            label: 'Standard',
            text: "The 20% sports cashback applies to qualifying lost sports bets and is credited automatically to eligible accounts. Please review your account activity to confirm whether it has been applied.",
          },
          {
            label: 'High Empathy',
            text: "We want to ensure you are receiving every benefit you are entitled to. The 20% sports cashback is automatically credited on qualifying losses. Please review your account activity and if it has not reflected, kindly share your phone number and we will investigate immediately.",
          },
        ],
      },
    ],
  },
  {
    id: 8,
    title: 'CASE MANAGEMENT & COOLING',
    description: 'High-touch responses for frustrated or waiting clients and technical escalations.',
    subsections: [
      {
        id: '8.1',
        title: 'Case Submitted to Technical Team',
        triggers: 'review, check, technical, wait, pending, status, feedback',
        variants: [
          {
            label: 'Standard',
            text: "Your case has been submitted to our Technical Team for review. We will provide an update as soon as feedback is received. We appreciate your patience.",
          },
          {
            label: 'Alt A',
            text: "Your request is currently under technical review. We will notify you as soon as it has been processed. Please bear with us.",
          },
          {
            label: 'Alt B',
            text: "Your issue has been escalated and is currently being handled by the appropriate team. We will share an update as soon as it becomes available.",
          },
          {
            label: 'Alt C',
            text: "Your case is already with our Technical Team. We will revert the moment it has been resolved.",
          },
          {
            label: 'Alt D',
            text: "All relevant information has been forwarded to the appropriate team and they are actively working on it. You will hear from us as soon as there is progress.",
          },
          {
            label: 'High Empathy A',
            text: "We know that waiting is not easy and we genuinely appreciate your patience. Your issue is under active review and we will provide an update as soon as possible.",
          },
          {
            label: 'High Empathy B',
            text: "Your case is receiving active attention and we have not lost sight of it. We will reach out with an update shortly. Thank you for your continued patience.",
          },
          {
            label: 'High Empathy C',
            text: "We understand how important this is and we are handling it with the urgency it deserves. Our team is on it and we will update you as soon as there is something to share.",
          },
        ],
      },
      {
        id: '8.2',
        title: 'Ticket Still in Queue',
        triggers: 'queue, waiting, not attended, still waiting, my case',
        variants: [
          {
            label: 'Standard',
            text: "Your support ticket is currently in our active queue and will be reviewed promptly by a SafiBets representative. We sincerely appreciate your patience.",
          },
          {
            label: 'Alt A',
            text: "We have not overlooked your case. It is in the queue and will be addressed as soon as our team is available. Thank you for your patience.",
          },
          {
            label: 'High Empathy A',
            text: "We sincerely appreciate your patience. Your ticket is in the queue and we will notify you as soon as there is movement. We are working through cases as efficiently as possible.",
          },
          {
            label: 'High Empathy B',
            text: "We understand the wait can feel long and we apologize for that. Your case is in the queue and our team is working through them as quickly as possible. We will reach out the moment yours is addressed.",
          },
        ],
      },
      {
        id: '8.3',
        title: 'Password Reset - Ticket Filed',
        triggers: "forgot password, reset password, can't log in, password request",
        variants: [
          {
            label: 'Standard',
            text: "Your password reset request has been received and logged as a ticket. Our team will process it in the order received. Please monitor your registered contact details for the reset notification.",
          },
          {
            label: 'Alt A',
            text: "Your password reset request has been logged and is in our queue. We will process it as soon as possible. We appreciate your patience.",
          },
          {
            label: 'High Empathy',
            text: "We understand how inconvenient it is to be locked out and we will work to restore your access as quickly as possible. Your password reset request has been filed and our team will attend to it shortly. Please watch your registered contact for the notification once it comes through.",
          },
        ],
      },
      {
        id: '8.4',
        title: 'Cooling - Pending Withdrawal (Frustrated Client)',
        triggers: 'still waiting for my money, withdrawal pending long, where is my withdrawal, frustrated',
        variants: [
          {
            label: 'High Empathy A',
            text: "We completely understand how stressful it is when your funds have not arrived as expected and we sincerely apologize for the wait. Your withdrawal is being actively processed and we are doing everything possible to expedite it. Please allow us just a little more time.",
          },
          {
            label: 'High Empathy B',
            text: "We recognize this is a difficult situation and we greatly appreciate your patience. Your withdrawal is in progress and our team is managing it. We will update you the moment it has been cleared.",
          },
          {
            label: 'High Empathy C',
            text: "We hear you and we are equally committed to resolving this as quickly as possible. Your case has been prioritized. Please allow us a little more time and we will follow up with you directly.",
          },
        ],
      },
      {
        id: '8.5',
        title: 'Cooling - Pending Lost Amount Case (Frustrated Client)',
        triggers: 'still no update on my money, game loss case, amounts missing, case not resolved',
        variants: [
          {
            label: 'High Empathy A',
            text: "We understand how unsettling it is when funds are not reflecting as expected and we want to resolve this for you. Your case has been escalated and our Technical Team is conducting a full review of all transactions. Please allow us a little more time and we will update you with the outcome.",
          },
          {
            label: 'High Empathy B',
            text: "We know this is important to you and we are committed to getting it right. Our team is actively reviewing your case and we will have an answer for you once the review is complete. Thank you for your patience.",
          },
          {
            label: 'High Empathy C',
            text: "We have not overlooked your case and it is being handled with urgency. These reviews require some time to ensure accuracy, but we will update you as soon as our team has reached a conclusion. We are grateful for your understanding.",
          },
        ],
      },
      {
        id: '8.6',
        title: 'Cooling - Pending Account Closure (Frustrated Client)',
        triggers: 'account not closed yet, still active, when will it close, account closure delay',
        variants: [
          {
            label: 'High Empathy A',
            text: "We understand this may not be the response you were hoping for and we sincerely apologize for the delay. Your account closure request has been logged and is in our technical queue. Requests are processed in the order they are received and yours is being attended to. Please refrain from any account activity during this period to avoid delays.",
          },
          {
            label: 'High Empathy B',
            text: "We recognize the urgency of your request and we apologize for the wait. Your closure request is in the queue and our team will finalize it as soon as possible. To ensure the process is not reversed, please refrain from depositing or requesting an OTP until the closure is fully completed.",
          },
          {
            label: 'High Empathy C',
            text: "Your request is in capable hands. Account closures are processed through a technical queue on a first-come, first-served basis. We appreciate your patience and want you to know your request is being handled with care. Please avoid any account activity in the meantime to keep the process on track.",
          },
        ],
      },
    ],
  },
  {
    id: 9,
    title: 'LOST / FOUND AMOUNTS',
    description: 'Discrepancy investigations, rollbacks, and verified non-loss confirmations.',
    subsections: [
      {
        id: '9.1',
        title: 'Filing a Lost Amount Case - Requesting Details',
        triggers: 'lost amount, missing funds, balance wrong, deducted, disappeared',
        variants: [
          {
            label: 'Standard',
            text: "We regret that you are experiencing this and we will investigate right away. To file your case accurately, kindly share your registered phone number, the game you were playing, the amount you believe is missing, and the exact time the discrepancy was noticed. We will revert with our findings.",
          },
          {
            label: 'Alt A',
            text: "We take this matter seriously and will act immediately. Please provide your phone number, the game played, the missing amount, and the exact time. We will file your case and begin the review straight away.",
          },
          {
            label: 'High Empathy',
            text: "We understand how alarming it is to notice an unexpected change in your balance and we want to resolve this for you. Please share your phone number, the game you were playing, the amount, and the exact time so we can file this case and investigate thoroughly. We will keep you updated throughout the process.",
          },
        ],
      },
      {
        id: '9.2',
        title: 'Roll Back - Funds Successfully Returned',
        triggers: 'refund, returned, rollback, funds back, credited back, balance updated',
        variants: [
          {
            label: 'Standard',
            text: "We are pleased to confirm that the amount has been successfully rolled back to your account. Please refresh and verify that your balance has been updated.",
          },
          {
            label: 'Alt A',
            text: "Your funds have been returned. Please refresh your account and confirm that everything reflects correctly.",
          },
          {
            label: 'Alt B',
            text: "This has been resolved. The amount has been credited back to your account. Please refresh and confirm your balance.",
          },
          {
            label: 'High Empathy',
            text: "We are very pleased that we were able to resolve this for you. Your funds have been successfully returned to your account. Please refresh and let us know if everything appears correct.",
          },
        ],
      },
      {
        id: '9.3',
        title: 'No Lost Amount - All Transactions Correct',
        triggers: 'no loss, all correct, review complete, no missing funds',
        variants: [
          {
            label: 'Standard',
            text: "Following a comprehensive review, our Technical Team has confirmed that all transactions on your account were processed correctly and no funds are missing. We recommend reviewing your account activity for a full breakdown.",
          },
          {
            label: 'Alt A',
            text: "The review has been completed. All transactions have been verified as correct and no funds are unaccounted for. If you notice anything further, please share the specific time and amount and we will conduct an additional review.",
          },
          {
            label: 'High Empathy',
            text: "We appreciate your patience while we conducted this review and we are glad we had the opportunity to investigate this for you. Our team has confirmed that all transactions were processed correctly and no funds were lost. Kindly review your activity history and if anything still appears unusual, please let us know and we will take another look.",
          },
          {
            label: 'Frustrated / Disbelieving Client',
            text: "We fully appreciate that this may not be the response you were expecting and we thank you for your patience throughout. Our Technical Team conducted a thorough review of every transaction on your account during the relevant period and found no discrepancies. All funds are accounted for in our system records. If there is a specific round or timeframe you would like us to re-examine, please share it and we will conduct an additional review.",
          },
        ],
      },
    ],
  },
  {
    id: 10,
    title: 'ACCOUNT MANAGEMENT',
    description: 'Logins, verifications, number changes, reactivations, and referral violations.',
    subsections: [
      {
        id: '10.1',
        title: "Login Issues - Can't Access Account",
        triggers: 'cannot login, access account, forgot password, otp, locked account',
        variants: [
          {
            label: 'Standard',
            text: "We regret that you are unable to access your account. Kindly provide your registered phone number so we may review the account status and assist with restoring access promptly.",
          },
          {
            label: 'Reset Flow',
            text: "If you have forgotten your password, please use the 'Forgot Password' option on the login page. A reset link or OTP will be sent to your registered number immediately.",
          },
          {
            label: 'High Empathy',
            text: "We understand how inconvenient it is to be locked out of your account and we will restore your access as quickly as possible. Please share your registered phone number so we can verify your account.",
          },
          {
            label: 'Locked Account',
            text: "Your account may have been temporarily locked due to multiple unsuccessful login attempts. Please share your registered phone number and we will check the status and assist you immediately.",
          },
        ],
      },
      {
        id: '10.2',
        title: 'Reset Not Working / Password Reset Failed',
        triggers: 'reset not working, password reset failed, otp not received, reset link broken, cannot reset password, reset error',
        variants: [
          {
            label: 'Standard',
            text: "We apologize that the password reset is not functioning as expected. Please share your registered phone number and confirm whether you are receiving the OTP or encountering an error message. We will review your account status and assist with restoring access immediately.",
          },
          {
            label: 'Alt A',
            text: "If the password reset link or OTP is not being received or is failing, please send your registered phone number along with a description or screenshot of the error encountered so we can verify your account and initiate a manual reset.",
          },
          {
            label: 'Troubleshooting / Clear Cache',
            text: "If you are experiencing difficulty resetting your password, please try clearing your browser cache or accessing the page in incognito mode. If the issue continues, kindly share your registered phone number and we will assist you directly.",
          },
          {
            label: 'High Empathy',
            text: "We understand how frustrating it is when a password reset fails and access to your account is restricted. Please share your registered phone number and our team will verify your account and restore your login access without delay.",
          },
        ],
      },
      {
        id: '10.3',
        title: 'Account Verification Request',
        triggers: 'verify, verification, registered phone, confirm name',
        variants: [
          {
            label: 'Standard',
            text: "Please provide your registered phone number so we may verify your account and assist you.",
          },
          {
            label: 'Alt',
            text: "To verify your account, kindly share your registered phone number and the name used at registration. This allows us to locate your account and assist you promptly.",
          },
          {
            label: 'High Empathy',
            text: "We are happy to assist. Please share your registered phone number so we may verify your account and attend to you as efficiently as possible.",
          },
        ],
      },
      {
        id: '10.4',
        title: 'Account Reactivation',
        triggers: 'reactivate, unblock, open account, active again',
        variants: [
          {
            label: 'Standard',
            text: "Good news. Your account has been successfully reactivated. You may now log in and resume play.",
          },
          {
            label: 'High Empathy',
            text: "Great news. Your account is active once more. Please go ahead and log in. We are here if you need any further assistance.",
          },
        ],
      },
      {
        id: '10.5',
        title: 'Phone Number Change Request',
        triggers: 'change number, update number, phone change, update contact',
        variants: [
          {
            label: 'Standard',
            text: "For security purposes, phone number updates require identity verification. Please share your current registered number, the full name on the account, and your reason for the change and we will assist from there.",
          },
          {
            label: 'High Empathy',
            text: "We understand and we will make this process as straightforward as possible. To maintain account security, identity verification is required before the number is updated. Please share your current registered number, your full name, and the reason for the change.",
          },
        ],
      },
      {
        id: '10.6',
        title: 'Referral Violation - Multiple Accounts Detected',
        triggers: 'multiple accounts, referral violation, bonus abuse, restriction, reset',
        variants: [
          {
            label: 'Standard',
            text: "Following a review of your account activity, our team has identified a violation of our referral terms due to multiple accounts being created under the same identity to obtain the KSh 10 referral bonus. Based on checks including device verification, connection history, referral activity, and location data, withdrawals have been restricted. To restore withdrawal access, an account reset is required, which will clear all current funds. Please confirm whether you wish to proceed.",
          },
          {
            label: 'High Empathy',
            text: "We appreciate your patience and we understand this may be difficult to hear. Following a review of your account, our system identified a referral policy violation involving multiple accounts registered under the same identity to claim the KSh 10 bonus. Based on device, connection, referral, and location verification, withdrawals have been restricted. To restore access, an account reset is required and current funds will be cleared. Please confirm whether you would like to proceed.",
          },
          {
            label: 'Final Notice',
            text: "As previously communicated, withdrawals remain restricted as a result of a confirmed referral policy violation. To restore access, an account reset is required. Please confirm your decision so we may proceed accordingly.",
          },
        ],
      },
      {
        id: '10.7',
        title: 'Account Reset Confirmation',
        triggers: 'reset complete, account reset, successful reset, restored',
        variants: [
          {
            label: 'Standard',
            text: "Your account has been successfully reset. You may now log in and resume activity. Please ensure all future activity is conducted in compliance with our referral and platform policies.",
          },
          {
            label: 'High Empathy',
            text: "Your account has been reset and is ready for use. Please log in at your convenience. We encourage you to ensure that all future activity is within our platform and referral guidelines to avoid further restrictions. We are here if you need any assistance.",
          },
        ],
      },
      {
        id: '10.8',
        title: 'Account Reset Feature Offline / Not Working',
        triggers: 'reset offline, reset not working, account reset error, reset button not working, reset feature down, cannot reset account',
        variants: [
          {
            label: 'Standard',
            text: "We apologize for the inconvenience. The account reset feature is currently offline for system maintenance and updates. Our technical team is actively working on this and access will be restored upon completion of the update. Please check back shortly.",
          },
          {
            label: 'Alt A',
            text: "The account reset tool is temporarily unavailable due to ongoing technical maintenance. Our team is working to restore it as soon as possible. We appreciate your patience during this period.",
          },
          {
            label: 'High Empathy',
            text: "We understand you are looking to reset your account and we apologize for this inconvenience. The account reset feature is currently offline for technical maintenance. We appreciate your patience and will notify you once it has been restored.",
          },
        ],
      },
    ],
  },
  {
    id: 11,
    title: 'ACCOUNT CLOSURE & SELF-EXCLUSION',
    description: 'Exclusion walkthrough, 48-72h technical queue, and OTP reversal warning.',
    subsections: [
      {
        id: '11.1',
        title: 'Account Closure - Step-by-Step Guide',
        triggers: 'permanently close, delete my account, close account, deactivate',
        variants: [
          {
            label: 'Standard',
            text: "To close your SafiBets account, please follow these steps: 1 Visit safibets.ke/delete-account 2 Navigate to Profile 3 Select DELETE Account 4 Choose your Period of Exclusion 5 Click Continue To Delete Account 6 Type DELETE to confirm, with no spaces 7 Confirm the deletion. Important: Please refrain from depositing or requesting an OTP for at least 48 hours after confirming. Any account activity during that window will reverse the process.",
          },
          {
            label: 'High Empathy',
            text: "We respect your decision fully. To close your account: Visit safibets.ke/delete-account, go to Profile, select DELETE Account, choose your exclusion period, click Continue, type DELETE to confirm, then confirm. Kindly avoid any deposits or OTP requests for at least 48 hours after confirming, as any activity will reverse the closure process.",
          },
          {
            label: 'Self-Exclusion Focused',
            text: "We fully support your decision and commend you for taking this step. To self-exclude: Visit safibets.ke/delete-account, Profile, DELETE Account, select your exclusion period (temporary or permanent), Continue, type DELETE, then confirm. Please avoid all account activity for 48 hours after confirming. We are proud of you for making this decision.",
          },
        ],
      },
      {
        id: '11.2',
        title: 'Closure Request Received - Queue Notice',
        triggers: 'account deletion submitted, request received, closed yet, when will it close',
        variants: [
          {
            label: 'Standard',
            text: "Your account deletion request has been received and logged into our technical queue. Closures are processed in the order they are received. Please allow up to 72 hours for the team to finalize the block on all reactivation features including OTPs. To avoid delays, please refrain from any account activity during this period.",
          },
          {
            label: 'High Empathy A',
            text: "Your request has been received and logged. Closures are processed first come, first served, and yours is in the queue. Please allow up to 48 to 72 hours for the process to be fully completed. In the meantime, please avoid depositing or requesting an OTP as doing so will reverse the closure request.",
          },
          {
            label: 'High Empathy B',
            text: "We have received your request and it is being processed. We understand that waiting can be frustrating when you have made this decision and we genuinely appreciate your patience. Please refrain from any account activity, including OTP requests and deposits, until the closure is fully finalized.",
          },
          {
            label: 'High Empathy C',
            text: "Your request has been received and is being handled with care. Closures are processed in the order they arrive and your place in the queue is confirmed. Please avoid all account activity during this period. We will confirm once the closure is fully completed.",
          },
        ],
      },
      {
        id: '11.3',
        title: 'OTP / Deposit During Closure Window - Process Reversed',
        triggers: 'otp, deposited during closure, undid request, closure reversed, logged in',
        variants: [
          {
            label: 'Standard',
            text: "It appears that account activity occurred during the closure processing window, which has interrupted the process. To proceed with the closure, please re-initiate the request from your account and avoid all activity, including deposits and OTP requests, for the full 48 to 72 hour processing period.",
          },
          {
            label: 'High Empathy',
            text: "We understand this may be frustrating and we apologize for the confusion this has caused. Any account activity such as depositing or requesting an OTP during the closure window automatically reverses the process as a built-in safeguard. To proceed, please re-initiate the closure request and avoid all account activity for the full 48 to 72 hour processing period. We are here to support you throughout.",
          },
        ],
      },
      {
        id: '11.4',
        title: 'Closure Confirmed - Final Message',
        triggers: 'closure done, account closed, exclusion confirmed, deleted',
        variants: [
          {
            label: 'Standard',
            text: "Your account has been successfully closed. We are sorry to see you go and we wish you all the best. Should you ever wish to return, you are always welcome at SafiBets.",
          },
          {
            label: 'High Empathy',
            text: "Your account has been fully closed. We sincerely hope your experience with SafiBets was a positive one overall. Please take good care of yourself and know that our support team is always here should you ever need anything. We wish you well.",
          },
        ],
      },
    ],
  },
  {
    id: 12,
    title: 'RESPONSIBLE GAMING',
    description: 'High-care support for distressed clients, loss chasing, and welfare protection.',
    subsections: [
      {
        id: '12.1',
        title: 'RG Distress - Client Overwhelmed',
        triggers: "lost everything, can't stop, help me stop, overwhelmed, distress",
        variants: [
          {
            label: 'Standard',
            text: "We hear you and your wellbeing is our primary concern. Please remember that betting should always remain within comfortable limits. If you are feeling overwhelmed, we strongly encourage you to take a break. Self-exclusion can be activated right now: Visit safibets.ke/delete-account, navigate to Profile, select DELETE Account, choose your exclusion period, and confirm. We are here for you.",
          },
          {
            label: 'High Empathy',
            text: "We are sincerely glad you reached out and we hear you clearly. Please take a moment to breathe. Your wellbeing is far more important than any outcome on the platform. You can step away at any time: Visit safibets.ke/delete-account, Profile, DELETE Account, select an exclusion period, and confirm. We are proud of you for taking this step.",
          },
        ],
      },
      {
        id: '12.2',
        title: 'Chasing Losses - High Risk',
        triggers: 'recover losses, chasing, high risk, chase, win back',
        variants: [
          {
            label: 'Response A',
            text: "We strongly advise against continuing play in an attempt to recover losses. This approach carries significant risk. Please take a break and return only when you feel fully composed and in control.",
          },
          {
            label: 'Response B',
            text: "It is important to pause and reconsider at this point. Pursuing losses can lead to further financial and emotional strain. We can assist with self-exclusion or deposit limits if required. Please let us know.",
          },
          {
            label: 'Response C',
            text: "For your safety and wellbeing, we do not encourage continued play to recover losses. If you need to step back, self-exclusion options are available and we will guide you through the process. You are not alone in this.",
          },
        ],
      },
      {
        id: '12.3',
        title: 'Self-Exclusion Request',
        triggers: 'activate self exclusion, exclusion steps, take a break, block my account',
        variants: [
          {
            label: 'Standard',
            text: "To activate self-exclusion, please follow these steps: Visit safibets.ke/delete-account, navigate to Profile, click DELETE Account, choose your exclusion period (temporary or permanent), click Continue, type DELETE to confirm, then confirm the deletion. Important: Please avoid depositing or requesting an OTP for at least 48 hours after confirming, as any activity will reverse the process.",
          },
          {
            label: 'High Empathy',
            text: "We respect and fully support your decision. To self-exclude: Visit safibets.ke/delete-account, Profile, DELETE Account, select your exclusion period, Continue, type DELETE, then confirm. Please avoid any account activity for 48 hours after confirming. We are genuinely proud of you for taking this step.",
          },
        ],
      },
      {
        id: '12.4',
        title: 'General Responsible Gaming Notice',
        triggers: 'responsible gaming, limits, break, well-being',
        variants: [
          {
            label: 'Standard',
            text: "Your well-being is of the utmost importance to us. We encourage all players to bet responsibly and within their financial means. Should you ever feel the need to take a break, self-exclusion or account closure is available at any time and we will support you through it.",
          },
          {
            label: 'High Empathy',
            text: "We genuinely care about your well-being and we want you to know that. If betting ever becomes stressful or feels out of control, we encourage you to take a break or activate self-exclusion. Our support team is always here for you and you do not need to navigate this alone.",
          },
        ],
      },
    ],
  },
  {
    id: 13,
    title: 'HARD CASES',
    description: 'Refund refusals, persistent loop breakers, compliance responses, and BCLB audits.',
    subsections: [
      {
        id: '13.1',
        title: 'Refund Demand',
        triggers: 'refund me, give my money back',
        variants: [
          {
            label: 'Firm Policy',
            text: "We appreciate you reaching out. Please be advised that SafiBets does not issue refunds on completed bets or deposits unless a verified system error has been identified. Following a review of your account, no system faults were found.",
          },
          {
            label: 'Empathy',
            text: "We understand your frustration and we regret that this outcome has not met your expectations. However, refunds on completed bets or deposits are only issued upon confirmation of a verified system error. Following a thorough review, no faults were identified on your account.",
          },
        ],
      },
      {
        id: '13.2',
        title: 'Refund Refusal - No Valid Claim',
        triggers: 'no refund, applicable, system data, no fault, review done',
        variants: [
          {
            label: 'Response A',
            text: "Following a comprehensive review by our Technical and Risk teams, all transactions on your account were processed correctly. No discrepancies were identified and no refund is applicable under our terms and conditions.",
          },
          {
            label: 'Response B',
            text: "We have reviewed your account activity carefully and all transactions were processed correctly. We are unable to issue a refund, however we are happy to walk you through the transaction breakdown upon request.",
          },
          {
            label: 'Response C',
            text: "The review has been completed and our findings confirm that no system error occurred. Refunds are only issued where a verified system fault is identified. This decision is final in accordance with platform policy.",
          },
        ],
      },
      {
        id: '13.3',
        title: 'Persistent Argument - Loop Breaker',
        triggers: 'argument, not fair, outcome, final, loop, repeating',
        variants: [
          {
            label: 'Response A',
            text: "We have shared our findings based on verified system data. If you have new information that has not yet been reviewed, we are happy to consider it. Otherwise, the outcome remains final.",
          },
          {
            label: 'Response B',
            text: "At this point the outcome is final, based on verified records. We understand this may not be the resolution you were hoping for and we genuinely appreciate your patience throughout.",
          },
          {
            label: 'Response C',
            text: "We acknowledge your position and we have considered it carefully. However, this decision is grounded in system logs and cannot be reversed. If new information becomes available, please share it and we will review it immediately.",
          },
        ],
      },
      {
        id: '13.4',
        title: 'Client Threatens to Report or Escalate - Compliance and Audit Response',
        triggers: 'report you, lawyer, authority, sue, legal, escalate, escalate to authorities, cooperate, BCLB',
        variants: [
          {
            label: 'Standard',
            text: "We appreciate you raising your concerns and we take all matters seriously. SafiBets operates in full compliance with the Betting Control and Licensing Board (BCLB) regulations. You are welcome to escalate through the appropriate channels and we will cooperate fully, providing complete account logs for any formal review.",
          },
          {
            label: 'Compliance Detail',
            text: "SafiBets operates in full compliance with the Betting Control and Licensing Board (BCLB) regulations. All transactions and bet histories are subject to independent audit. You are welcome to escalate through the appropriate channels and we will fully cooperate by providing complete account records for any formal review.",
          },
          {
            label: 'Brief',
            text: "We understand. Our platform is fully audited and compliant. You are free to escalate through official channels and we will support any review with complete transparency.",
          },
          {
            label: 'Firm',
            text: "Our systems are fully auditable and compliant with all applicable regulations. We are confident in the review outcome and welcome any formal review process.",
          },
          {
            label: 'Transparent',
            text: "You are welcome to escalate and we will fully support the process. Our records clearly document the complete transaction flow and we will cooperate with any formal review without reservation.",
          },
        ],
      },
      {
        id: '13.5',
        title: 'Suspected Fraud / Bonus Abuse',
        triggers: 'fraud, bonus abuse, irregular, restricted, fair use',
        variants: [
          {
            label: 'Standard',
            text: "Following an internal review, irregular activity has been detected on this account. As a result, withdrawals have been temporarily restricted pending further investigation. We are not in a position to share the full details of the investigation at this stage but will be in contact once the review has concluded.",
          },
        ],
      },
      {
        id: '13.6',
        title: 'Compliance Refund Review',
        triggers: 'compliance, audit, refund documentation, formal review',
        variants: [
          {
            label: 'Standard',
            text: "Refund requests are subject to strict compliance review. Please provide all relevant documentation along with your registered phone number so that our audit team may evaluate your case appropriately.",
          },
        ],
      },
    ],
  },
  {
    id: 14,
    title: 'JACKPOTS & EARLY PAYOUT',
    description: 'Sports Jackpot, Bazooka Jackpot rules, and Early Payout (1UP/2UP) feature explanations.',
    subsections: [
      {
        id: '14.1',
        title: 'Sports Jackpot - General Inquiry',
        triggers: 'sports jackpot, jackpot prize, win 5 bets, streak jackpot, jackpot how to win',
        variants: [
          {
            label: 'Standard',
            text: "The Sports Jackpot offers an opportunity to win KES 100,000 by placing 5 qualifying bets consecutively within the same calendar day. Each bet must meet all three criteria: total odds of 7.00 or higher, a minimum cash stake of KES 50, and all individual selections must be at odds of 1.30 or higher. Bets not meeting these thresholds are excluded and have no impact on the streak. The streak resets at midnight EAT daily. A losing qualifying bet resets the streak to zero. Cashed-out and voided bets are neutral. Prizes are verified by our team and credited to your wallet upon confirmation.",
          },
          {
            label: 'Alt A',
            text: "The Sports Jackpot awards KES 100,000 to players who achieve 5 qualifying consecutive wins on the same day. Requirements include total odds of at least 7.00, a minimum cash stake of KES 50, and all individual selections at odds of 1.30 or higher. The streak resets at midnight EAT, and any losing qualifying bet resets the streak. Cashed-out and voided bets are neutral. Prizes are reviewed and credited to your wallet by our team.",
          },
          {
            label: 'High Empathy',
            text: "Thank you for asking about the Sports Jackpot. You have the opportunity to win KES 100,000 by achieving 5 qualifying consecutive wins within the same calendar day. Each qualifying bet requires total odds of 7.00 or more, a minimum stake of KES 50, and all selections must be at 1.30 odds or higher. Bets falling short of these thresholds are excluded. All 5 wins must occur before midnight EAT when the streak resets. A losing qualifying bet restarts the streak. Cashed-out and voided bets have no effect on the streak. Once completed, our team verifies and credits the prize to your wallet.",
          },
        ],
      },
      {
        id: '14.2',
        title: 'Sports Jackpot - Qualifying Bet Rules',
        triggers: 'jackpot qualifying, jackpot odds requirement, jackpot stake, sports jackpot rules, jackpot selection',
        variants: [
          {
            label: 'Standard',
            text: "Each qualifying Sports Jackpot bet must satisfy three requirements: total odds of 7.00 or higher, a minimum cash stake of KES 50, and all individual selections within the bet must be at odds of 1.30 or higher. Any bet not meeting these thresholds is simply excluded and has no effect on your streak.",
          },
          {
            label: 'Alt A',
            text: "To qualify for the Sports Jackpot, your bet must have total odds of at least 7.00, a cash stake of at least KES 50, and each individual selection must be at 1.30 odds or higher. Bets that do not meet these requirements are excluded and have no impact on your streak.",
          },
        ],
      },
      {
        id: '14.3',
        title: 'Sports Jackpot - Streak & Void/Cashout Rules',
        triggers: 'jackpot streak, jackpot void, jackpot cashout, jackpot reset, streak reset',
        variants: [
          {
            label: 'Standard',
            text: "All 5 Sports Jackpot wins must be achieved within the same calendar day, as the streak resets at midnight EAT. A losing qualifying bet immediately resets your streak to zero. Cashed-out and voided bets are neutral and have no effect on the streak in either direction. The jackpot is repeatable, meaning a new streak begins on your next qualifying bet after a win.",
          },
          {
            label: 'Alt A',
            text: "The Sports Jackpot streak must be completed within a single calendar day, as it resets at midnight EAT. A losing qualifying bet resets the streak to zero. Voided and cashed-out bets are neutral. Once the jackpot is won, it is repeatable and a new streak begins on your next qualifying bet.",
          },
        ],
      },
      {
        id: '14.4',
        title: 'Bazooka Jackpot - General Inquiry',
        triggers: 'bazooka jackpot, bazooka prize, win 7 rounds, bazooka cashout, crash jackpot',
        variants: [
          {
            label: 'Standard',
            text: "The Bazooka Jackpot is awarded to players who cash out at 2.50x or higher for 7 consecutive qualifying rounds. A minimum bet of KES 20 is required per round and the cashout must reach 2.50x or above to count. In rounds containing multiple slots, only one slot is required to reach 2.50x for the round to qualify. Any non-qualifying round resets the streak. The jackpot is repeatable and the streak restarts after each win. The prize pool reflects the current live amount displayed in the game.",
          },
          {
            label: 'Alt A',
            text: "To win the Bazooka Jackpot, cash out at 2.50x or higher for 7 consecutive rounds with a minimum stake of KES 20 per round. In multi-slot rounds, only one slot needs to reach 2.50x to qualify. Any round that does not qualify resets the streak to zero. The jackpot is repeatable and the streak restarts from your next qualifying round after each win.",
          },
          {
            label: 'High Empathy',
            text: "The Bazooka Jackpot is an exciting ongoing prize pool. To win, you must cash out at 2.50x or higher for 7 consecutive rounds, with a minimum stake of KES 20 per round. For rounds with multiple slots, just one slot reaching 2.50x is sufficient for that round to qualify. Any missed round resets the streak entirely. The great news is that it is fully repeatable, so a new streak begins immediately after each win.",
          },
        ],
      },
      {
        id: '14.5',
        title: 'Bazooka Jackpot - Rules & Streak',
        triggers: 'bazooka rules, bazooka streak, bazooka qualifying, bazooka reset',
        variants: [
          {
            label: 'Standard',
            text: "Each qualifying Bazooka Jackpot round requires a minimum bet of KES 20 and a cashout of 2.50x or higher. In rounds with multiple slots, only one slot needs to achieve 2.50x for the round to qualify. Any round that does not qualify resets the streak entirely. The jackpot is repeatable and a new streak commences immediately after each win.",
          },
          {
            label: 'Alt A',
            text: "Each Bazooka Jackpot round requires a stake of at least KES 20 and a cashout of 2.50x or higher. In multi-slot rounds, a single slot reaching 2.50x counts as the round win. Failing to meet the cashout threshold in any round resets the streak. The jackpot can be won repeatedly, with a new streak starting from the next qualifying round.",
          },
        ],
      },
      {
        id: '14.6',
        title: 'Early Payout - General (1UP / 2UP)',
        triggers: 'early payout, 1UP, 2UP, win before final whistle, goal ahead payout, early win',
        variants: [
          {
            label: 'Standard',
            text: "The Early Payout feature enables you to secure a win before the conclusion of a match. With 1UP, your bet is settled as a win the moment your selected team takes a 1-goal lead, regardless of the final result. With 2UP, the settlement is triggered when your team leads by 2 goals. This applies to Match Result singles on eligible football fixtures. Odds are slightly lower in exchange for the early settlement guarantee, and once the specified lead is achieved, the outcome is locked in.",
          },
          {
            label: 'Alt A',
            text: "Early Payout settles your bet before the final whistle. With 1UP, your bet is marked as a win the instant your team takes a 1-goal lead. With 2UP, settlement is triggered upon your team going 2 goals ahead. This feature is available on Match Result singles for eligible football matches. Please note that odds are slightly reduced, but the win is locked in permanently once the qualifying lead is established.",
          },
          {
            label: 'High Empathy',
            text: "Thank you for asking about Early Payout. This feature is designed to provide certainty during live matches. With 1UP, the moment your team goes 1 goal ahead, your bet is settled as a win regardless of what follows. With 2UP, settlement is triggered once your team leads by 2 goals. It is available on Match Result singles for eligible football games. The trade-off is slightly reduced odds, but once the qualifying lead is reached, your win is secured immediately.",
          },
        ],
      },
      {
        id: '14.7',
        title: 'Early Payout - 1UP Explained',
        triggers: '1UP, one goal ahead, 1 goal payout, 1up feature',
        variants: [
          {
            label: 'Standard',
            text: "With 1UP, your bet is automatically settled as a win the moment your selected team goes 1 goal ahead in an eligible match, irrespective of the final score. Even if the opposing team equalizes or the match ends in a loss, your bet has already been settled as a winner. This applies to Match Result singles on eligible football games, with odds slightly reduced to reflect the early-win guarantee.",
          },
          {
            label: 'Alt A',
            text: "With 1UP, the instant your team establishes a 1-goal lead in an eligible football match, your bet is settled as a winner. The final result has no bearing once the lead is achieved. This is available exclusively on Match Result singles and carries slightly reduced odds compared to a standard bet.",
          },
        ],
      },
      {
        id: '14.8',
        title: 'Early Payout - 2UP Explained',
        triggers: '2UP, two goals ahead, 2 goal payout, 2up feature',
        variants: [
          {
            label: 'Standard',
            text: "2UP operates on the same principle as 1UP but is triggered when your team establishes a 2-goal lead. The moment that lead is reached in an eligible football match, your Match Result single is immediately settled as a win. Nothing that occurs after that point affects your payout. Odds are marginally lower than standard to account for the early settlement advantage.",
          },
          {
            label: 'Alt A',
            text: "With 2UP, your bet is settled as a win the instant your team leads by 2 goals in an eligible football match. Once that lead is secured, your winnings are locked in regardless of the final score. Like 1UP, this is only available on Match Result singles and carries slightly reduced odds.",
          },
        ],
      },
    ],
  },
  {
    id: 15,
    title: 'ESCALATED CASES',
    description: 'Sensitive, escalated, or policy-bound scenarios requiring firm but professional responses.',
    subsections: [
      {
        id: '15.1',
        title: 'Aviator Hacks, Tips & Hash Seeds',
        triggers: 'aviator hack, seed, hash, tips, trick, cheat, rain trigger, multiplier',
        variants: [
          {
            label: 'Standard',
            text: "Please note that server seed hashes and associated configurations form part of our internal security protocols and cannot be disclosed upon request. The fairness system is independently managed and monitored in accordance with our platform policies and terms of service. We are unable to share confidential cryptographic details pertaining to future rounds.",
          },
          {
            label: 'Alt A',
            text: "We are unable to provide hacks, tips, or guarantees regarding Aviator rain triggers, nor can we disclose any account balance thresholds linked to such outcomes. Results are determined by the game's mechanics and cannot be influenced or predicted by external means. We encourage you to participate in the Aviator game responsibly and claim rains as they occur.",
          },
          {
            label: 'Alt B',
            text: "Please note that Aviator game outcomes are generated automatically by the game system and are not manually configured or controlled by our team. Multiplier frequencies may vary between rounds and prior outcomes do not influence subsequent ones. We encourage all players to engage responsibly.",
          },
        ],
      },
      {
        id: '15.2',
        title: 'Relentless / Aggressive / Insults',
        triggers: 'rude, insult, aggressive, abusive, threatening, swearing',
        variants: [
          {
            label: 'Standard',
            text: "Please note that if you remain dissatisfied with the information provided, you may elect to self-exclude from our platform in accordance with our responsible gaming policy. We kindly request that all communication be conducted respectfully.",
          },
          {
            label: 'Alt A',
            text: "We are committed to assisting you, however we require all interactions to remain respectful and professional. Should you remain dissatisfied, you are welcome to self-exclude in accordance with our responsible gaming policy.",
          },
        ],
      },
      {
        id: '15.3',
        title: 'Account Closure Yet Still Active',
        triggers: 'account not closed, still active, not deleted, deactivation pending',
        variants: [
          {
            label: 'Standard',
            text: "Please note that your account remains active as a result of recent account activity, which has prevented the deletion from proceeding. Permanent account deactivation requires up to 72 hours to process following self-exclusion. During this period, we ask that you refrain from making deposits or requesting OTPs, as any account activity may interrupt the deactivation process.",
          },
          {
            label: 'Alt A',
            text: "As previously advised, your account deletion request has been received and is currently in the processing queue. Please exercise patience and adhere to the provided guidelines to ensure a smooth deactivation process. We encourage responsible engagement during this period.",
          },
        ],
      },
      {
        id: '15.4',
        title: 'Withdrawal Eligibility & Minimums',
        triggers: 'withdrawal minimum, first withdrawal, referral withdrawal, withdraw ksh 250, withdraw ksh 50',
        variants: [
          {
            label: 'Standard',
            text: "Provided you remain compliant with our terms and conditions, withdrawals will be processed without issue. For your first withdrawal using referral earnings, the minimum required is Ksh 250. Once several deposits have been made, the minimum threshold for subsequent withdrawals is reduced to Ksh 50.",
          },
          {
            label: 'Alt A',
            text: "Please note that the minimum withdrawal amount for first-time referrals is Ksh 250. Once several deposits have been made to your account, the minimum threshold for subsequent withdrawals is lowered to Ksh 50, subject to continued compliance with our terms and policies.",
          },
        ],
      },
      {
        id: '15.5',
        title: 'Account Reset — Funds Cleared',
        triggers: 'account reset, funds cleared, balance zero after reset, reset request',
        variants: [
          {
            label: 'Standard',
            text: "Please note that an account reset is an irreversible process. You previously requested an account reset following a violation of our terms and conditions. In accordance with our policies and regulations, all funds held in your account were cleared upon completion of the reset. No funds remained on the account thereafter.",
          },
          {
            label: 'Alt A',
            text: "In accordance with our policies, an account reset results in the full clearance of all account funds. As the reset was initiated following a terms violation, the balance was cleared as per standard procedure. We are unable to reinstate those funds.",
          },
        ],
      },
      {
        id: '15.6',
        title: 'Bribe Attempt',
        triggers: 'bribe, offer money, pay you, deal, under the table',
        variants: [
          {
            label: 'Standard',
            text: "Please note that this conduct is in direct violation of our company policies and regulations and constitutes fraudulent activity. Any further suspicious activity on your account may result in suspension. We strongly urge you to adhere to our policies to safeguard your account.",
          },
          {
            label: 'Alt A',
            text: "This form of communication is in direct violation of our terms of service and constitutes fraudulent conduct. We are obligated to flag this interaction. We strongly advise that you refrain from such communications to avoid account suspension.",
          },
        ],
      },
      {
        id: '15.7',
        title: 'Flagged Account',
        triggers: 'flagged, account suspended, irregular, withdrawal suspended, under investigation',
        variants: [
          {
            label: 'Standard',
            text: "Please note that your account was flagged for irregularities and the necessary action was taken accordingly, including the reversal of funds. Please be assured that this action was not taken maliciously and was conducted in full accordance with our account review procedures.",
          },
          {
            label: 'Alt A',
            text: "Your account has been flagged for irregularities. As a result, certain account privileges including withdrawals have been suspended. Your account remains under active investigation and you will be informed of the outcome upon conclusion of the review.",
          },
          {
            label: 'Alt B',
            text: "The funds in your account are currently unavailable for withdrawal as the account has been flagged for irregularities. The necessary measures were taken, including account suspension and the removal of withdrawal privileges, to protect the integrity of the account. There is no specific resolution timeline at this stage and you will be duly informed once the review is concluded.",
          },
        ],
      },
      {
        id: '15.8',
        title: 'Lost / Failed Bets',
        triggers: 'failed bet, lost bet, bet not recorded, missing bet, bet disappeared',
        variants: [
          {
            label: 'Standard',
            text: "Please note that our system records all bet activity, including failed bets. Following a review of your account, we can confirm that no failed bets have been recorded. Should you have specific evidence or a transaction reference, please share it so we may investigate further.",
          },
          {
            label: 'Alt A',
            text: "All bet activity is captured within our system. Following a review of your account, we can confirm that there are no failed or unrecorded bets on our end. If you have a specific transaction reference or evidence, please share it and we will investigate.",
          },
        ],
      },
      {
        id: '15.9',
        title: 'Completed Transactions — No Pending Funds',
        triggers: 'no funds, transaction complete, already sent, disbursed, no pending',
        variants: [
          {
            label: 'Standard',
            text: "Please be advised that we are not withholding any funds, as all amounts were disbursed from our end. There are no pending transactions on our side. We remain committed to providing the highest level of service to all our clients.",
          },
          {
            label: 'Alt A',
            text: "Our review confirms that all transactions have been completed successfully and there are no pending transactions or outstanding funds on our end.",
          },
        ],
      },
      {
        id: '15.10',
        title: 'Data / Account Closure Processing',
        triggers: 'data removal, close account, delete data, account closure delay',
        variants: [
          {
            label: 'Standard',
            text: "We sincerely apologize for the delay in processing your account closure. Please be assured that we are actively working to ensure the complete removal of your data from our systems. We appreciate your patience and understanding throughout this process.",
          },
          {
            label: 'Alt A',
            text: "Please note that account deactivation is a procedural process and complete data clearance cannot be completed within a single day. We kindly request your patience while the process is completed in accordance with our Terms and Conditions. You will be informed once finalized.",
          },
        ],
      },
      {
        id: '15.11',
        title: 'Aviator / M-PESA Global Delays',
        triggers: 'aviator down, mpesa delay, global issue, system down, no timeline',
        variants: [
          {
            label: 'Standard',
            text: "Please note that this is a global issue and as such, no specific resolution timeline has been established. Our team is working as quickly as possible to resolve the matter. We appreciate your patience.",
          },
          {
            label: 'Alt A',
            text: "The delay you are experiencing is attributable to a system-wide issue that is currently being addressed. A confirmed resolution timeline is not yet available, however our team is working urgently to restore full service. We sincerely appreciate your patience.",
          },
        ],
      },
      {
        id: '15.12',
        title: 'How to Bet / Play',
        triggers: 'how to bet, how to play, how to deposit, cant play, not participating',
        variants: [
          {
            label: 'Standard',
            text: "Please note that a deposit is required before you may participate in any games on the platform. Depositing enables you to place bets and compete for winnings, subject to game outcomes.",
          },
          {
            label: 'Alt A',
            text: "Please note that your account is currently under review as it has been flagged for irregularities. Your ticket is pending and has not yet been attended to. We appreciate your patience and will provide an update upon completion of the review.",
          },
        ],
      },
      {
        id: '15.13',
        title: 'Review Before Withdrawals (Referral)',
        triggers: 'referral review, referral withdrawal hold, verification before withdrawal',
        variants: [
          {
            label: 'Standard',
            text: "Please note that following a referral, your account may be subject to a standard review prior to any withdrawals being processed. This is a routine verification measure implemented to prevent discrepancies and fraudulent activity.",
          },
          {
            label: 'Alt A',
            text: "Referral-related withdrawals are subject to a standard account review before processing. This is a routine compliance step to ensure the integrity of all transactions. You will be notified once the review has been completed.",
          },
        ],
      },
      {
        id: '15.14',
        title: 'Resolved Case',
        triggers: 'resolved, case closed, issue fixed, problem solved',
        variants: [
          {
            label: 'Standard',
            text: "We are pleased to confirm that your case has been successfully resolved. We appreciate your patience and cooperation throughout the process. Should you require further assistance, please do not hesitate to contact us.",
          },
          {
            label: 'Alt A',
            text: "We are glad to inform you that your case has been fully resolved. We appreciate your patience. Should any further concerns arise, our team is always available to assist you.",
          },
        ],
      },
      {
        id: '15.15',
        title: 'Account Manipulation Claim',
        triggers: 'manipulation, edited, changed, altered account, tampered',
        variants: [
          {
            label: 'Standard',
            text: "Please be advised that we do not have access to individual accounts and are therefore unable to manipulate or alter any account data. Should you have a screenshot of the relevant bet or transaction, we would be happy to review it and, where applicable, credit your account accordingly.",
          },
          {
            label: 'Alt A',
            text: "Our support agents do not have the capability to modify, edit, or alter account data in any capacity. If you believe an error has occurred, please share the relevant evidence and we will escalate the matter for investigation.",
          },
        ],
      },
      {
        id: '15.16',
        title: 'Fake / Fraudulent Transactions',
        triggers: 'fake transaction, fake mpesa, edited screenshot, fraudulent payment, false transaction',
        variants: [
          {
            label: 'Standard',
            text: "Please note that the transaction presented does not correspond with our records. Kindly refrain from submitting altered or fraudulent transaction details. Should you have a legitimate query, please provide accurate transaction information so we may investigate accordingly.",
          },
          {
            label: 'Alt A',
            text: "Following a cross-reference with our records, the transaction provided does not appear to be authentic. We strongly advise against the submission of falsified information. If you have a genuine query, please provide accurate transaction details for review.",
          },
        ],
      },
      {
        id: '15.17',
        title: 'First Withdrawal — Ksh 250 Minimum (Referral)',
        triggers: 'first withdrawal, ksh 250, referral earnings minimum, can i withdraw 250',
        variants: [
          {
            label: 'Standard',
            text: "Yes, Ksh 250 is the minimum amount required for your first withdrawal when using referral earnings. Please ensure your referral earnings have reached this minimum before initiating a withdrawal.",
          },
          {
            label: 'Alt A',
            text: "For first-time withdrawals via referral earnings, the minimum threshold is Ksh 250. Once this amount is reached and your account is in good standing, you may proceed to request your withdrawal.",
          },
        ],
      },
      {
        id: '15.18',
        title: 'Transaction History Request',
        triggers: 'transaction history, account history, betting history, statement, mpesa statement',
        variants: [
          {
            label: 'Standard',
            text: "For a comprehensive transaction history, please request a full M-PESA statement directly from Safaricom and review your bet history within your account. Please note that we are unable to provide this information directly as we do not have access to your personal account details in accordance with our data protection policy.",
          },
          {
            label: 'Alt A',
            text: "Your full transaction history is available through your account dashboard. For M-PESA records, please request a statement from Safaricom directly. We are unable to issue personal account statements from our end in compliance with our data protection policy.",
          },
        ],
      },
      {
        id: '15.19',
        title: 'Cashback Queries',
        triggers: 'cashback, no cashback, cashback not received, cashback follow up',
        variants: [
          {
            label: 'Standard',
            text: "Please note that no follow-up is required for cashback, as it is credited automatically by the system. If cashback was not issued for the previous period, this is not an error. As previously communicated, your cashback will be credited at 8:35 PM following the reset window. Kindly review your transaction history to confirm the timing of your deposit.",
          },
          {
            label: 'Alt A',
            text: "Please note that depositing an amount equal to your withdrawal does not automatically qualify you for cashback. Cashback is only applicable where a net loss is recorded, in accordance with the cashback terms and conditions.",
          },
        ],
      },
      {
        id: '15.20',
        title: 'Bet Settlement — Penalties Not Counted',
        triggers: 'penalty, penalties, penalty goal, extra time, bet not settled correctly, wrong result',
        variants: [
          {
            label: 'Standard',
            text: "Please note that penalties are not included in the settlement outcome as the match is considered concluded at the end of regular time. Penalty shoot-outs form part of additional proceedings and do not constitute part of the standard match result for settlement purposes.",
          },
          {
            label: 'Alt A',
            text: "For settlement purposes, match outcomes are determined at the conclusion of regular time unless the relevant market specifically includes extra time or penalties. Penalty shoot-outs are treated as a separate procedure and are excluded from standard match result settlement.",
          },
        ],
      },
      {
        id: '15.21',
        title: 'Security & Data Protection',
        triggers: 'data breach, hacked, security, data leaked, account compromised',
        variants: [
          {
            label: 'Standard',
            text: "Please be advised that no security breaches have occurred on our platform. If you have evidence to the contrary, please share it with us for immediate review. The security and protection of our clients' data is a matter we take very seriously and robust measures are in place to safeguard all information.",
          },
          {
            label: 'Alt A',
            text: "Please be assured that the security and confidentiality of our clients' data remains our highest priority. No breach has been identified on our end. If you have specific concerns or evidence, we encourage you to share them so we may review and respond appropriately.",
          },
        ],
      },
    ],
  },
];
