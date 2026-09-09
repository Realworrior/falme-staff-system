export const SOFABETS_DATA = [
  {
    id: 1,
    title: 'CHAT FLOW & ENGAGEMENT',
    description: 'First touchpoint. Acknowledge fast, set a warm tone, get the client talking.',
    subsections: [
      {
        id: '1.1',
        title: 'Client Says Hi / Silent After Auto Greeting',
        triggers: 'hi, hello, hey, greeting',
        variants: [
          {
            label: 'Standard',
            text: "Hello! You're through to SofaBets support. Go ahead and let us know what you need help with and we'll get on it right away.",
          },
          {
            label: 'Alt A',
            text: "Hey there! SofaBets support is live. Tell us what's going on and we'll sort it out straight away.",
          },
          {
            label: 'Alt B',
            text: "Hello! Great to hear from you. Share your issue and our support team will handle it from here.",
          },
          {
            label: 'Alt C',
            text: "Hi! You're connected with the SofaBets support team. Please share your concern and we'll get on it immediately.",
          },
          {
            label: 'High Empathy',
            text: "Hello! Whatever's going on, we're here for you. Go ahead and tell us what happened and we'll work through it together.",
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
            text: "Hello! To get things moving quickly, please share your registered phone number and a brief description of what's going on. We'll take it from there.",
          },
          {
            label: 'Alt A',
            text: "Hi! We're ready to help. Send us your registered phone number and explain the problem so we can get started right away.",
          },
          {
            label: 'Alt B',
            text: "Hello! We're here. Kindly share your account number and describe the issue so our team can look into it immediately.",
          },
          {
            label: 'Alt C',
            text: "Hi! We'd love to help. Please send your phone number and let us know what's happening so we can check straight away.",
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
            text: "We're on this right now. To check immediately, please share your registered phone number, the amount, and the exact time of the transaction.",
          },
          {
            label: 'Alt A',
            text: "Got it, we're checking now. Send your phone number, the amount, and the exact time and we'll prioritize your case immediately.",
          },
          {
            label: 'Alt B',
            text: "Your issue is our priority. Share your phone number, the amount, and the transaction time and we'll get back to you without delay.",
          },
          {
            label: 'High Empathy',
            text: "We hear you and we want this fixed as fast as possible. Please share your registered number, the amount, and the exact time and we'll look into it straight away.",
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
            text: "We understand you're frustrated and we genuinely want to resolve this for you. Kindly keep things respectful so we can assist you as well as possible. Please tell us what happened.",
          },
          {
            label: 'Alt A',
            text: "We're here to help and your concern matters to us. Please share the issue calmly so we can work on it together right away.",
          },
          {
            label: 'Alt B',
            text: "We get that things feel frustrating and we want to fix this. Please explain what happened and we'll do everything we can to assist.",
          },
          {
            label: 'Firm Boundary',
            text: "We want to help and we'll do everything we can. However, we do need respectful communication to continue. Please share your concern calmly and we'll get on it right away.",
          },
          {
            label: 'High Empathy',
            text: "We hear you and we genuinely want to help. Please let us know what happened and we'll work through it together. Just keep it friendly so we can give you our full focus.",
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
            text: "Thank you for reaching out to SofaBets. We're happy your issue is resolved. Feel free to get in touch anytime you need us.",
          },
          {
            label: 'Alt A',
            text: "All done! Thanks for your patience. We're always here whenever you need us.",
          },
          {
            label: 'Alt B',
            text: "Happy to help! Your account is sorted. Don't hesitate to reach out anytime.",
          },
          {
            label: 'Alt C',
            text: "Everything is resolved. Thanks for contacting us. SofaBets support is always here for you.",
          },
          {
            label: 'High Empathy',
            text: "We really appreciate your patience throughout this. We're glad it's all sorted. Take care and enjoy the game!",
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
            text: "You can reach our live support team directly anytime at https://blastchat.chat/chat/sofabets. Connect with an agent for instant help.",
          },
          {
            label: 'Alt A',
            text: "To speak directly with a SofaBets support agent, head over to https://blastchat.chat/chat/sofabets. We'll be ready to assist you right away.",
          },
          {
            label: 'High Empathy',
            text: "We want to get this sorted for you as soon as possible. Connect directly with our live support team at https://blastchat.chat/chat/sofabets. We're here for you!",
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
            text: "We're sorry your deposit hasn't come through yet. We'll get this sorted quickly. Please send your registered phone number, the amount deposited, and the 10-character M-PESA code from your confirmation SMS, for example UC8U77YY7Q. Please type it as text, not a screenshot, and note that mini-statement codes will not work.",
          },
          {
            label: 'Alt A',
            text: "No problem, we'll get this cleared up for you. Kindly send your registered phone number, the deposit amount, and the 10-character M-PESA code (e.g. UC8U77YY7Q) typed as plain text rather than a screenshot. We'll verify and top up your balance right away.",
          },
          {
            label: 'Alt B',
            text: "To track and credit your deposit, we need three things: your registered phone number, the amount deposited, and the 10-character code from your M-PESA SMS (e.g. UC8U77YY7Q). Please send it as plain text, not as a screenshot.",
          },
          {
            label: 'High Empathy',
            text: "We know how annoying a delayed deposit can be and we're here to sort it. Please send the phone number you deposited from, the exact amount, and the 10-character M-PESA code from your SMS (for example UC8U77YY7Q). Text only please, and we'll check this straight away.",
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
            text: "To verify and credit your deposit right away, please copy and paste your full M-PESA confirmation SMS here, for example: 'UC8U77YY7Q Confirmed. Ksh276.00 transferred to SOFABETS LIMITED for account 0712345678 on 8/3/26 at 1:15 AM.' Send it as text, not a screenshot.",
          },
          {
            label: 'Alt A',
            text: "Please copy and paste the complete M-PESA confirmation SMS into the chat as text, for example: 'UC8U77YY7Q Confirmed. Ksh276.00 transferred to SOFABETS LIMITED for account 0712345678 on 8/3/26 at 1:15 AM.' Once we have the full message, we'll verify and update your balance immediately.",
          },
          {
            label: 'High Empathy',
            text: "We want to update your balance as fast as possible. Please copy your entire M-PESA confirmation message from your inbox and paste it here in the chat (e.g. 'UC8U77YY7Q Confirmed. Ksh276.00 transferred to SOFABETS LIMITED for account 0712345678 on 8/3/26 at 1:15 AM.'). Having the full message text lets us confirm and credit you straight away.",
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
            text: "Please share the details as text rather than a screenshot. Text from screenshots can't be copied directly, which creates a risk of errors when manually typing characters that look alike, like number 1 vs letter I, or number 0 vs letter O. Sending the code or message as text lets us verify your deposit immediately and accurately.",
          },
          {
            label: 'Alt A',
            text: "We kindly ask that you copy and paste the text from your SMS instead of sending a screenshot. Screenshots can't be entered into our system directly and manual typing often leads to mix-ups between similar characters like 1 and I or 0 and O. Text ensures quick, accurate verification.",
          },
          {
            label: 'High Empathy',
            text: "We know it feels easier to send a screenshot, but typing errors from images can delay your credit. Characters like letter O versus zero 0, or uppercase I versus number 1, can easily be confused. Pasting the actual text from your SMS lets us verify and credit your account instantly.",
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
            text: "Please note that mini-statement codes can't be used for deposit verification. When you request a mini-statement, M-PESA creates a single batch code covering your last 5 transactions combined, not the unique code for this specific deposit. We need the individual 10-character code from the actual deposit confirmation SMS, for example UC8U77YY7Q.",
          },
          {
            label: 'Alt A',
            text: "The code you've sent looks like a mini-statement reference. Safaricom generates one 10-digit reference for the entire mini-statement covering your last 5 transactions, which can't be matched to a specific deposit in our system. Please check your messages for the deposit SMS and share the 10-character transaction code from it (e.g. UC8U77YY7Q) as text.",
          },
          {
            label: 'High Empathy',
            text: "This is a very common mix-up, so no worries. Mini-statement codes cover your last 5 transactions under one M-PESA batch reference, so our system can't match it to your individual deposit. We need the specific 10-character code from the payment SMS you received when you made this deposit (for example UC8U77YY7Q). Please send that one and we'll credit you right away.",
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
            text: "No worries at all. You can still get the transaction code in two ways: check your M-PESA app under transaction history for the specific 10-character code, or contact Safaricom directly on 100 for a full official M-PESA statement. Please note that mini-statement codes covering the last 5 transactions cannot be accepted.",
          },
          {
            label: 'Alt A',
            text: "That's okay. You can find the code in your M-PESA app under transaction history, or by calling Safaricom on 100 for a full statement. Just remember that mini-statement codes won't work for individual deposit verification.",
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
            text: "You can also check your deposit directly from the SofaBets platform. Here's how: Open your account, scroll to the footer, tap 'Deposit Unsuccessful?', then enter the 10-character code from your M-PESA SMS, for example SJ82KFNAX4. Quick and straightforward.",
          },
          {
            label: 'Alt',
            text: "There's a handy self-check option in the platform. Open your account, scroll to the footer, tap 'Deposit Unsuccessful?', and enter the 10-character M-PESA code from your deposit SMS. You'll get an instant update.",
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
            text: "Unfortunately SofaBets does not support Bonga Points deposits. Accounts are only linked to one registered M-PESA number and our system can't credit payments made via Bonga Points. Please contact Safaricom directly to request a reversal by calling 100 or sending a WhatsApp to 0722000100. Once the funds are back, you can deposit using your registered M-PESA number.",
          },
          {
            label: 'Alt A',
            text: "Bonga Points are not an accepted deposit method on SofaBets. Our platform only processes direct M-PESA transactions from your registered number, so Bonga Point payments can't be credited. To get your funds back, please reach Safaricom on 100 or WhatsApp 0722000100 and request a reversal.",
          },
          {
            label: 'High Empathy',
            text: "We're sorry for the inconvenience. Bonga Points can't be used to fund your SofaBets account since we only support standard M-PESA deposits from your registered number. Please contact Safaricom as soon as possible on 100 or WhatsApp 0722000100 to reverse the payment. Once it's reversed, deposit using M-PESA and we'll sort you out right away.",
          },
          {
            label: 'Plain Language',
            text: "Bonga Points don't work for deposits here. We only accept regular M-PESA payments from the phone number on your account. Please call Safaricom on 100 or WhatsApp 0722000100 to get your points back. After the reversal, deposit again using standard M-PESA.",
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
            text: "Airtel Money is not a supported deposit method on SofaBets. We only process M-PESA payments from your registered number, so Airtel Money transactions can't be credited. Please contact Airtel right away to initiate a reversal by calling 100 or emailing airtelmoney@airtel.com. Once the funds are back, deposit using your registered M-PESA number.",
          },
          {
            label: 'Alt A',
            text: "We're sorry but Airtel Money deposits aren't accepted on SofaBets. Our platform only supports M-PESA from your registered number, meaning Airtel Money payments can't reflect on your account. To recover your funds, call Airtel on 100 or email airtelmoney@airtel.com to request a reversal, then re-deposit via M-PESA.",
          },
          {
            label: 'High Empathy',
            text: "We completely understand this is frustrating and we want to help you get your funds back quickly. Airtel Money isn't supported on SofaBets, which means the payment can't be credited to your account. Please reach out to Airtel immediately on 100 or email airtelmoney@airtel.com to request a reversal. Once sorted, deposit via M-PESA and we'll assist from there.",
          },
          {
            label: 'Plain Language',
            text: "Airtel Money doesn't work for deposits on SofaBets. We only take M-PESA from the phone number linked to your account. Call Airtel on 100 or email airtelmoney@airtel.com to get your money back. Once reversed, deposit again with M-PESA.",
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
            text: "If you paid into our Paybill or Till by mistake, or deposited from a number not registered to your SofaBets account, we're unable to manually reverse the transaction. Our system only credits M-PESA payments from the specific number registered to your account. Please initiate a Safaricom reversal immediately by forwarding your payment SMS to 457 or calling Safaricom on 100.",
          },
          {
            label: 'Alt A',
            text: "We're unable to manually reverse payments made to our Paybill or Till, or from an unregistered number. Your account is tied to one specific M-PESA number and only payments from that number are accepted. Please contact Safaricom right away to request a reversal by forwarding the payment SMS to 457 or calling 100.",
          },
          {
            label: 'High Empathy',
            text: "We understand this is stressful and we're truly sorry for the inconvenience. Unfortunately SofaBets cannot process or manually reverse payments made to our Paybill or Till from an unregistered number. Our system only accepts M-PESA from the exact number linked to your account. Please act quickly and contact Safaricom to reverse the payment by forwarding your SMS to 457 or calling 100.",
          },
          {
            label: 'Plain Language',
            text: "Your deposit didn't go through because the payment came from a number not linked to your SofaBets account, or was sent to our Paybill or Till. We can only accept M-PESA from the specific phone number you registered with. We can't reverse this on our end. Contact Safaricom immediately: forward the M-PESA SMS you received to 457, call 100, or reverse it from the MySafaricom App.",
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
            text: "Your funds are safe, we want to assure you of that first. There's currently a temporary delay on the Safaricom network affecting some M-PESA deposits. This is not a SofaBets issue and everything will reflect automatically once the network is restored. We appreciate your patience.",
          },
          {
            label: 'Alt A',
            text: "Your money is safe and accounted for. There's a temporary delay on Safaricom's side affecting some deposits right now. Everything will come through on its own once service is restored. We're keeping an eye on it closely.",
          },
          {
            label: 'High Empathy',
            text: "We completely understand how stressful a delayed deposit feels and we want to put your mind at ease right away. The delay is on Safaricom's end, not ours. Your money is safe and will reflect as soon as the network is back to normal. Thank you sincerely for your patience.",
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
            text: "We apologize for the delay. We're seeing some slowness with M-PESA deposits at the moment. Please share your registered phone number and the M-PESA transaction code from your SMS and we'll manually verify and update your balance straight away.",
          },
          {
            label: 'High Empathy',
            text: "We're sorry about the wait and we completely understand your frustration. M-PESA is experiencing some delays right now. Please send your phone number and the transaction code from your M-PESA SMS and we'll update your balance right away.",
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
            text: "Your SofaBets account is linked to one specific M-PESA number, the one you registered with. Our system can only credit deposits sent directly from that exact number. Payments made via Bonga Points, Airtel Money, or sent to our Paybill or Till from a different number are not recognised and cannot be added to your balance. This is why we're unable to add those funds manually.",
          },
          {
            label: 'Plain Language',
            text: "Think of it this way: your SofaBets account is connected to only one M-PESA number, the one you signed up with. Our system checks every deposit and only accepts money coming from that same number. Bonga Points, Airtel Money, or payments to our Paybill or Till from a different number are like sending money to the wrong address. Our system doesn't see them and can't add them to your balance. That's why you need to reverse the payment and send it again from your registered M-PESA number.",
          },
          {
            label: 'Alt A',
            text: "Every account on SofaBets is tied to one registered M-PESA number. Our system only accepts deposits from that exact number. Bonga Points and Airtel Money are different payment systems that our platform doesn't recognise, so they can't be credited. Similarly, payments to our Paybill or Till from an unregistered number won't reflect. In all cases, you'll need to reverse the funds and re-deposit using your registered M-PESA number.",
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
            text: "Your SofaBets account is linked to one specific M-PESA number only, the one you registered with. Our system can only credit deposits from that exact number. Since the deposit came from an unregistered line, it can't reflect on your current account automatically. To resolve this, please create a new SofaBets account using the phone number that made the deposit. Once registered, share the M-PESA confirmation message with us and we'll verify and credit it to your new account right away.",
          },
          {
            label: 'Alt A',
            text: "Our system only credits deposits from the phone number registered to your SofaBets account. If you deposited from a different or unregistered number, those funds can't be added to your current profile. We recommend registering a SofaBets account using the number that made the payment. Once registered, send us the full M-PESA SMS and we'll verify and credit your balance straight away.",
          },
          {
            label: 'High Empathy',
            text: "We completely understand your concern and we're here to help get your funds credited. Every SofaBets account is tied to one specific M-PESA number, so payments from an unregistered number don't credit automatically. The easiest solution is to register an account with the exact phone number the deposit came from. After registering, please share the M-PESA payment SMS with us and we'll promptly verify and credit your account.",
          },
          {
            label: 'Plain Language',
            text: "Your SofaBets account only connects to the phone number you signed up with. If you sent money from a different SIM card or someone else's number, our system can't put it into your current account. Here's the simple fix: register a new SofaBets account using the phone number that made the payment. Once you've created the account, copy and paste the M-PESA message from that transaction here. We'll check it immediately and confirm your funds.",
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
            text: "We know this is worrying and we'll trace it right now. Please share your registered phone number, the withdrawal amount, and the exact time you made the request.",
          },
          {
            label: 'Alt A',
            text: "We're on it. Please send your phone number, the withdrawal amount, and the exact time of the request and we'll check straight away.",
          },
          {
            label: 'Alt B',
            text: "To trace your withdrawal we need three things: your phone number, the amount you withdrew, and the exact time of the request. Send those over and we'll get moving.",
          },
          {
            label: 'High Empathy',
            text: "We hear you and we want this resolved quickly. Please share your registered phone number, the amount, and the exact time of the withdrawal and we'll get straight on it.",
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
            text: "Most withdrawals go through within minutes. If yours has been pending for over 30 minutes, please share your phone number, the amount, and the exact request time so we can escalate this right away.",
          },
          {
            label: 'High Empathy',
            text: "We know how stressful it is when your money isn't moving and we're sorry for the wait. If it's been over 30 minutes, please send your phone number, the amount, and the time you made the request and we'll make this a priority.",
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
            text: "We're sorry to hear that. To trace this, please first confirm your M-PESA number is registered and active, then share your phone number, the withdrawal amount, and the exact time of the request and we'll investigate right away.",
          },
          {
            label: 'High Empathy',
            text: "We completely understand your concern and we'll get to the bottom of this. Please first confirm your M-PESA line is active, then send your phone number, the amount, and the exact time. We'll trace it straight away.",
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
            text: "We're sorry you're having trouble withdrawing. Please share your registered phone number so we can check your account status and work on restoring access for you right away.",
          },
          {
            label: 'Alt A',
            text: "It looks like there may be a restriction on your account. Kindly send your registered phone number and we'll review your status immediately and assist from there.",
          },
          {
            label: 'High Empathy',
            text: "We understand how frustrating this is and we want to fix it for you. Please send your registered phone number so we can check what's going on and restore your withdrawal access as quickly as possible.",
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
            text: "Thanks for your patience. Please note that withdrawals above KSh 100,000 are processed in batches on our system, which can cause a slight delay compared to regular withdrawals. To avoid this going forward, we'd suggest splitting large withdrawals into amounts of KSh 100,000 or less. Your funds are safe and will come through once the batch processes.",
          },
          {
            label: 'Alt A',
            text: "Our system handles withdrawals above KSh 100,000 in batches, which can take a little longer than usual. Your funds are secure and will reflect once the batch clears. To avoid future delays, try withdrawing in amounts below KSh 100,000 at a time.",
          },
          {
            label: 'High Empathy',
            text: "We understand that waiting on a large withdrawal is stressful and we want to reassure you. Amounts above KSh 100,000 are processed in batches on our end, which can take a bit longer. Your funds are safe and will reflect once the batch clears. Going forward, splitting into amounts below KSh 100,000 will keep things moving faster for you.",
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
            text: "Just a quick note on this. The KSh 250 minimum only applies to your first withdrawal when using a referral bonus without a prior deposit. Once that first withdrawal is done, the minimum drops to KSh 50 for all future withdrawals.",
          },
          {
            label: 'Alt A',
            text: "Your first referral bonus withdrawal requires a minimum balance of KSh 250. Once that first one goes through, the limit becomes KSh 50 going forward.",
          },
          {
            label: 'Impatient Client',
            text: "Almost there! Once your balance hits KSh 250, your withdrawal will open up immediately. Keep playing or top up and you'll be there in no time.",
          },
          {
            label: 'Firm / Policy',
            text: "We understand this might feel restrictive and we appreciate your patience. The KSh 250 threshold applies to first-time referral bonus withdrawals per our policy. Once you reach that mark, the minimum drops to KSh 50 for everything after.",
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
            text: "Your current balance is below the KSh 50 minimum withdrawal amount. Kindly top up or keep playing until you reach that amount and you'll be able to withdraw.",
          },
          {
            label: 'Alt',
            text: "Withdrawals require a minimum of KSh 50 in your account. Once you reach that mark, you can withdraw immediately.",
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
            text: "Good news! Your account is eligible for withdrawal. You can go ahead and proceed whenever you're ready.",
          },
          {
            label: 'Alt A',
            text: "Great news! Everything checks out and you can withdraw whenever you like.",
          },
          {
            label: 'Alt B - Retention',
            text: "You're all set to withdraw. Feel free to proceed or keep playing if you prefer. It's totally up to you!",
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
            text: "We're sorry for the inconvenience. We're currently experiencing some delays with M-PESA withdrawals. Our technical team is actively working with the provider to resolve this as quickly as possible. We appreciate your patience.",
          },
          {
            label: 'Alt A',
            text: "We apologize for the inconvenience. There are currently some delays with M-PESA withdrawals. Our team is working with the provider to get this resolved as fast as possible. Your funds are safe and we appreciate your patience.",
          },
          {
            label: 'High Empathy',
            text: "We completely understand how frustrating it is when your money isn't moving and we sincerely apologize for the delay. Our team is already on it and doing everything to get withdrawals back up as fast as possible. Thank you for staying with us.",
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
            text: "We're sorry that happened and we'll look into this right away. To investigate accurately, please share your registered phone number, the specific crash game you were playing, the exact amount lost per round, and the exact time the error occurred. Please list each round separately and do not combine amounts.",
          },
          {
            label: 'Alt A',
            text: "We'll check this for you right away. Please send your phone number, the crash game name, the amount lost per slot, and the exact time of the error. Each round must be listed separately.",
          },
          {
            label: 'High Empathy',
            text: "We understand how frustrating an unexpected error during a game can be and we take it seriously. Please share your phone number, the specific crash game, the amount lost per round, and the exact time it happened. List each round separately and we'll investigate immediately.",
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
            text: "We're on it. To verify your winnings, please share your registered phone number, a screenshot from your Bet History showing the winning round, the exact time of the cashout, and the amount won.",
          },
          {
            label: 'Alt A',
            text: "Let's get this sorted quickly. Please send your phone number, a Bet History screenshot showing the winning round, the cashout time, and the amount won.",
          },
          {
            label: 'High Empathy',
            text: "We understand this is concerning and you deserve to see those winnings in your wallet. Please send your phone number, a screenshot from your Bet History showing the won round, the cashout time, and the amount. We'll get this resolved as fast as possible.",
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
            text: "We're sorry for the interruption. The game is currently unavailable globally due to a technical issue on the provider's side. We're monitoring the situation and access will be restored as soon as the provider resolves it. Thank you for your patience.",
          },
          {
            label: 'High Empathy',
            text: "We're really sorry about this and we know how much you enjoy the game. It's currently down for all players due to an issue on the provider's end. We're in close contact with them and will get it back up as soon as possible. Hang tight!",
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
            text: "We're sorry to hear that and we'll investigate right away. Please share your registered phone number, the virtual game you were playing, the exact amount lost per round, and the exact time the error occurred. Please list each round separately.",
          },
          {
            label: 'Alt A',
            text: "We'll look into this for you. Please send your phone number, the virtual game name, the amount lost, and the exact time of the error. List each round separately and don't combine amounts.",
          },
          {
            label: 'High Empathy',
            text: "We understand how upsetting an unexpected loss during a game can be. Please share your phone number, the virtual game name, the amount lost per round, and the exact time. We'll investigate and update you as soon as possible.",
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
            text: "Let's get this sorted for you. Please share your registered phone number, a screenshot from your Bet History showing the winning round, the exact time, and the amount won.",
          },
          {
            label: 'High Empathy',
            text: "Congratulations on the win and let's make sure those funds land in your wallet. Please send your phone number, a screenshot from your Bet History with the winning round visible, the time, and the amount. We'll sort this out right away.",
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
            text: "After investigating your account and gameplay logs, we've confirmed that the cashout and winnings for that round were settled and credited correctly to your balance at the time of play. Please recheck your transaction history and account balance logs around that exact timeframe.",
          },
          {
            label: 'Alt A',
            text: "We've thoroughly reviewed your gaming session logs. The transaction was successfully completed and your winnings were added directly to your wallet at that time. Kindly review your transaction history to see the update.",
          },
          {
            label: 'High Empathy',
            text: "We understand why you wanted this checked and we've reviewed your full gaming logs carefully. We can confirm that your cashout was settled correctly and credited to your wallet in real time during your play. Kindly recheck your transactions around that time.",
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
            text: "We'll look into this right away. Please share your registered phone number and the Bet ID, for example #678534. A screenshot of the betslip is also helpful if you have one.",
          },
          {
            label: 'Alt A',
            text: "We're on it. Please send your phone number and Bet ID (e.g. #678534). Attach a betslip screenshot if available and we'll review without delay.",
          },
          {
            label: 'High Empathy',
            text: "We understand your concern and we want to get this resolved for you quickly. Please send your phone number and Bet ID. A screenshot is helpful but not mandatory. We'll review everything right away.",
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
            text: "No need to worry about this. Postponed matches typically take up to 48 hours after the original scheduled time for bookmakers to officially settle. Your betslip will update automatically once that's done and you don't need to do anything.",
          },
          {
            label: 'Alt A',
            text: "Postponed match betslips are settled by the bookmaker within 48 hours of the original kick-off time. Your betslip will update on its own. Just sit tight.",
          },
          {
            label: 'High Empathy',
            text: "We understand the wait can be frustrating, especially when you're eager to see the outcome. Postponed matches are settled by bookmakers within 48 hours of the original match time and your betslip will update automatically. We'll be here if anything changes.",
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
            text: "Following a detailed investigation by our Technical and Risk Management teams, we have confirmed that the bet in question was placed after the match had already started. Under our betting rules and T&Cs, all wagers must be placed before the official kick-off unless the market is specifically offered as in-play. As the event had already commenced when the bet was accepted, the betslip has been identified as irregular and has been voided. This decision is final.",
          },
          {
            label: 'Shorter Version',
            text: "After a thorough review, it was confirmed that this bet was placed after the match had already kicked off. Per our betting rules, all bets must be placed before kick-off unless it's an in-play market. The bet has been voided and this decision is final.",
          },
          {
            label: 'Empathy Add-On',
            text: "We understand this may be disappointing and we appreciate your patience with our review process. However, the findings confirm the bet was placed after the match started, which falls outside our T&Cs. The void decision stands in line with platform policy.",
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
            text: "We'll check this for you. Please share your phone number, the Bet ID, and the exact time you attempted the cash out so we can investigate.",
          },
          {
            label: 'System Note',
            text: "Cash out can become temporarily unavailable during live odds fluctuations or high traffic periods. If yours didn't go through, please send your phone number, Bet ID, and the exact time of the attempt so we can check what happened.",
          },
          {
            label: 'High Empathy',
            text: "We understand how frustrating this is, especially during a live game. Cash outs are very time-sensitive. Please send your phone number, Bet ID, and the exact time and we'll review what happened right away.",
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
            text: "Odds are locked in the moment you submit your bet and they can shift right up until that point. Please share your phone number and Bet ID so we can pull up exactly what was recorded at submission time.",
          },
          {
            label: 'High Empathy',
            text: "We understand this can be confusing and we're happy to check it. Odds are locked at the precise moment of submission. Kindly share your phone number and Bet ID and we'll pull up exactly what was recorded.",
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
            text: "We're sorry that happened. Bets can be declined for a few reasons — the market may have closed before submission, odds may have shifted during loading, or the stake may exceed the limit for that market. Please share your phone number and a screenshot of the error message so we can investigate.",
          },
          {
            label: 'High Empathy',
            text: "We're sorry your bet didn't go through. This can happen due to odds changes, stake limits, or market closure. Please share your phone number and the error screenshot so we can look into it and advise accordingly.",
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
            text: "We're currently upgrading our live betting feature to improve your experience. We apologize for the inconvenience and will let you know as soon as it's back online. Thank you for your patience.",
          },
          {
            label: 'High Empathy',
            text: "We're giving our live betting feature a quick upgrade to make it even better for you. It'll be back very soon and we appreciate you hanging in there with us!",
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
            text: "Great question! Here's what SofaBets currently offers: Tax-free bets, 10% daily cashback on losses, Unlimited rains on Aviator, KSh 10 referral bonus, 5% referral income, and a free bet when you refer an eligible user. Keep an eye on the platform for new promos!",
          },
          {
            label: 'High Empathy',
            text: "We love this question! SofaBets has some great offers running. You get: Tax-free bets, 10% daily cashback on losses, Unlimited Aviator rains, KSh 10 per referral, 5% referral income, and a free bet for each eligible referral. Stay tuned for even more!",
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
            text: "The deposit bonus was a limited-time offer and has already been fully claimed. Please stay tuned for upcoming promotions though — more great offers are on the way.",
          },
          {
            label: 'High Empathy',
            text: "We understand this may be disappointing and we're sorry you missed that one. That bonus was time-limited and has already been fully redeemed. Don't worry though — more promotions are coming up. Keep an eye on the platform.",
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
            text: "Happy to check this for you. Please confirm that your referral used your unique link and completed account verification. Once both conditions are met, the bonus credits automatically. If you'd like us to verify, send your registered phone number and the number of the person you referred.",
          },
          {
            label: 'High Empathy',
            text: "We understand this can be frustrating, especially when you're expecting a bonus. Kindly confirm that your referral signed up using your unique link and completed their account verification. The bonus is credited automatically once everything checks out. If it hasn't, share your phone number and the referral's number and we'll look into it.",
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
            text: "Aviator Rains are random promotional credits dropped in the Aviator game chat. They're available to players who are actively in the game at the time of the drop. There's no way to manually request a Rain, so just stay active and the next one could land on you!",
          },
          {
            label: 'High Empathy',
            text: "Rains are exciting and we love them too! They're randomly dropped in the Aviator chat for active players. No way to request one manually, so just keep playing and stay in the game. The next rain could be heading your way!",
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
            text: "Your cashback is calculated automatically and credited every day at 8:35 PM. If you had a net loss during the cashback period and are eligible, it will show up in your account after that time. No manual request is needed.",
          },
          {
            label: 'Alt A',
            text: "Cashback is processed daily at 8:35 PM. If your deposits exceeded your withdrawals during the period, it'll reflect automatically. Just check your balance after 8:35 PM.",
          },
          {
            label: 'Firm / Impatient Client',
            text: "Cashback is not instant. It is calculated once a day at 8:35 PM. If you're eligible based on your activity, it will appear automatically in your account. No action is needed.",
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
            text: "Cashback is only credited when your total deposits during the cashback period are higher than your total withdrawals, resulting in a net loss. If your withdrawals were equal to or exceeded your deposits, no cashback will be generated. This is calculated automatically by the system.",
          },
          {
            label: 'Alt A',
            text: "For cashback to be generated, your deposits must exceed your withdrawals within the cashback period. If there's no net loss, the system won't create a cashback entry. It's fully automatic.",
          },
          {
            label: 'Firm',
            text: "No net loss means no cashback. The system calculates this automatically every day. If your withdrawals matched or exceeded your deposits during the period, no cashback is issued.",
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
            text: "Here's how cashback works. The window runs from 8:35 PM yesterday to 8:35 PM today. The formula is: Total Deposits minus Total Withdrawals = Net Loss, then 10% of Net Loss = your Cashback. For example: Deposit KSh 1,000, Withdraw KSh 600, Net Loss = KSh 400, Cashback = KSh 40. Simple!",
          },
          {
            label: 'Simple Formula',
            text: "Quick formula for you. Deposits minus Withdrawals = Net Loss. Then 10% of that Net Loss = your cashback. So KSh 1,000 minus KSh 600 = KSh 400 net loss, which gives you KSh 40 credited at 8:35 PM.",
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
            text: "You'll receive cashback today at 8:35 PM if your deposits between 9:00 PM yesterday and 8:35 PM today were higher than your withdrawals and your account shows a net loss. It's all calculated automatically and no action is needed.",
          },
          {
            label: 'Alt',
            text: "Check at 8:35 PM. If your deposits during the cashback window were more than your withdrawals, cashback will be generated and credited automatically. If not, it won't be issued for that period.",
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
            text: "Happy to explain. Our cashback system runs a 10-minute reset window between 8:30 PM and 8:40 PM every day. Any deposits made during that specific window may not be captured in the current 24-hour cycle. This prevents synchronization errors during the daily reset. Deposits before or after that window are counted normally.",
          },
          {
            label: 'High Empathy',
            text: "Great question and we're glad you asked. Between 8:30 PM and 8:40 PM, our system performs its daily reset. Deposits made in that 10-minute window aren't always counted in the immediate cashback cycle because the system needs a clean slate to calculate correctly. Deposits outside that window are counted as normal. Thank you for your patience while we keep things accurate!",
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
            text: "The 20% sports cashback applies to qualifying lost sports bets and is credited automatically to eligible accounts. Check your account activity to confirm whether it has been applied.",
          },
          {
            label: 'High Empathy',
            text: "We want to make sure you're getting every benefit you qualify for. The 20% sports cashback is automatically credited on qualifying losses. Please check your account activity and if it hasn't reflected, share your phone number and we'll look into it right away.",
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
            text: "Your case has been submitted to our Technical Team for review. We'll update you as soon as we have feedback. Thank you for your patience.",
          },
          {
            label: 'Alt A',
            text: "Your request is now under technical review. We'll notify you once it's been processed. Sit tight and we'll be in touch.",
          },
          {
            label: 'Alt B',
            text: "We've escalated your issue and it's being handled by our team. We'll share an update as soon as it's available.",
          },
          {
            label: 'Alt C',
            text: "Your case is already with our Technical Team. We'll get back to you the moment it's done.",
          },
          {
            label: 'Alt D',
            text: "We've forwarded everything to the right team and they're on it. You'll hear from us as soon as there's movement.",
          },
          {
            label: 'High Empathy A',
            text: "We know waiting isn't easy and we genuinely appreciate your patience. Your issue is under active review and we will update you as soon as possible.",
          },
          {
            label: 'High Empathy B',
            text: "Your case is being actively handled and we haven't forgotten about you. We'll reach out with an update shortly. Thank you for staying with us.",
          },
          {
            label: 'High Empathy C',
            text: "We understand this matters to you and we're treating it with the urgency it deserves. Our team is on it and we'll update you as soon as we have something to share.",
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
            text: "Your ticket is in the queue and will be attended to shortly. We appreciate your patience.",
          },
          {
            label: 'Alt A',
            text: "We haven't forgotten you. Your case is queued and will be handled as soon as our team gets to it. Thank you for bearing with us.",
          },
          {
            label: 'High Empathy A',
            text: "We truly appreciate your patience. Your ticket is in the queue and we will notify you as soon as there's movement. We're working through cases as fast as we can.",
          },
          {
            label: 'High Empathy B',
            text: "We understand the wait feels long and we're sorry for that. Your case is queued and our team is moving through them as quickly as possible. We'll reach out the moment yours is up.",
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
            text: "We've received your password reset request and it has been filed. Our team will process it in the order received. Please keep an eye on your registered contact details for the reset notification.",
          },
          {
            label: 'Alt A',
            text: "Your password reset request has been logged and is in our queue. We'll process it as soon as we can. Thank you for your patience.",
          },
          {
            label: 'High Empathy',
            text: "We understand it's frustrating to be locked out and we want to get you back in as soon as possible. Your password reset has been filed and our team will get to it shortly. Please check your registered contact for the notification once it comes through.",
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
            text: "We completely understand how stressful it is when your money isn't where it should be and we sincerely apologize for the wait. Your withdrawal is being actively processed and we're doing everything we can to get it through. Please bear with us just a little longer.",
          },
          {
            label: 'High Empathy B',
            text: "We know this isn't easy and we really appreciate you staying with us. Your withdrawal is in progress and our team is on top of it. We'll update you the moment it clears.",
          },
          {
            label: 'High Empathy C',
            text: "We hear you and we're just as eager to get this resolved for you. Your case is being treated as a priority. Please give us just a little more time and we'll follow up directly.",
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
            text: "We understand how unsettling it is to not see your funds reflecting and we want to fix this for you. Your case has been escalated and our Technical Team is reviewing every transaction. Please give us a little more time and we'll update you with the outcome.",
          },
          {
            label: 'High Empathy B',
            text: "We know this is important to you and we want to get it right. Our team is actively going through your case and we'll have an answer for you as soon as the review is complete. Thank you for your patience.",
          },
          {
            label: 'High Empathy C',
            text: "We haven't forgotten about you and your case is being handled with urgency. These reviews take a little time to ensure accuracy, but we promise to update you the moment we have a finding. Thank you so much for your understanding.",
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
            text: "We understand this isn't the immediate response you were hoping for and we're truly sorry for the wait. Your account closure request has been logged and is in our technical queue. The team is processing requests in the order they come in and yours is being handled. Please avoid any account activity during this period to avoid delays.",
          },
          {
            label: 'High Empathy B',
            text: "We hear you and we know waiting is the last thing you want right now. Your closure request is in the queue and our team will finalize it as soon as they get to it. To avoid the process being undone, please refrain from depositing or requesting an OTP until it's fully processed.",
          },
          {
            label: 'High Empathy C',
            text: "Your request is in good hands. Account closures go through a technical queue and are processed first come, first served. We appreciate your patience and want you to know your request is being taken seriously. Please hold off on any account activity in the meantime to keep things on track.",
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
            text: "We're sorry to hear this and we'll investigate right away. To file your case accurately, please share your registered phone number, the game you were playing, the amount you believe is missing, and the exact time you noticed the discrepancy. We'll get back to you with our findings.",
          },
          {
            label: 'Alt A',
            text: "We take this seriously and we're on it. Please send your phone number, the game you were playing, the missing amount, and the exact time. We'll file your case immediately and begin the review.",
          },
          {
            label: 'High Empathy',
            text: "We understand how alarming it is to see an unexpected change in your balance and we want to get to the bottom of this for you. Please share your phone number, the game you were playing, the amount, and the exact time so we can file this and investigate thoroughly. We'll keep you updated every step of the way.",
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
            text: "Good news! The amount has been successfully rolled back to your account. Please refresh and confirm your balance has updated.",
          },
          {
            label: 'Alt A',
            text: "Your funds are back! Please refresh your account and check that everything reflects correctly.",
          },
          {
            label: 'Alt B',
            text: "All sorted! The amount has been credited back to your account. Refresh and confirm your balance.",
          },
          {
            label: 'High Empathy',
            text: "Great news and we're so glad we could sort this out for you! Your funds have been successfully returned to your account. Please refresh and let us know if everything looks correct.",
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
            text: "After a full review, our Technical Team has confirmed that all transactions on your account were processed correctly and no funds are missing. Please check your account activity for a detailed breakdown.",
          },
          {
            label: 'Alt A',
            text: "We've completed the review. All transactions show as correct and no funds are unaccounted for. If you still notice anything unusual, please share the specific time and amount and we'll take another look.",
          },
          {
            label: 'High Empathy',
            text: "We appreciate your patience while we reviewed this and we're glad we could look into it for you. Our team has confirmed that all transactions processed correctly and no funds were lost. Please check your activity history and if anything still looks off, let us know and we'll take another look.",
          },
          {
            label: 'Frustrated / Disbelieving Client',
            text: "We completely understand this may not be the answer you were expecting and we appreciate your patience throughout. Our Technical Team conducted a thorough review of every transaction on your account during the period in question and no discrepancies were found. All funds are accounted for as per our system records. If there's a specific round or time you'd like us to re-examine, please share it and we'll look again.",
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
            text: "We're sorry you can't access your account. Please share your registered phone number so we can check the account status and help restore access right away.",
          },
          {
            label: 'Reset Flow',
            text: "If you've forgotten your password, use the 'Forgot Password' option on the login page. A reset link or OTP will be sent to your registered number immediately.",
          },
          {
            label: 'High Empathy',
            text: "We understand how frustrating it is to be locked out and we'll get you back in as fast as possible. Please share your registered phone number so we can verify the account and restore access.",
          },
          {
            label: 'Locked Account',
            text: "Your account may have been temporarily locked due to multiple failed login attempts. Please share your registered phone number and we'll check the status and assist you immediately.",
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
            text: "We're sorry to hear the password reset is not working. Please share your registered phone number and confirm whether you are receiving the OTP or if you encounter an error message. We will check your account and assist with resetting access immediately.",
          },
          {
            label: 'Alt A',
            text: "If the password reset link or OTP isn't coming through or is failing, please send us your registered phone number and a description or screenshot of the error so we can verify your account and trigger a manual reset for you.",
          },
          {
            label: 'Troubleshooting / Clear Cache',
            text: "If you're having trouble resetting your password, try clearing your browser cache or opening the page in incognito mode. If the issue persists, share your registered phone number and we will assist directly.",
          },
          {
            label: 'High Empathy',
            text: "We understand how frustrating it is when a password reset fails and you're locked out. Please share your registered phone number with us. Our team will verify your account and ensure your login access is restored right away.",
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
            text: "Please share your registered phone number so we can verify your account and assist you.",
          },
          {
            label: 'Alt',
            text: "To verify your account, kindly share your registered phone number and confirm the name used at registration. This helps us locate and assist you quickly.",
          },
          {
            label: 'High Empathy',
            text: "Happy to help! Please share your registered phone number so we can verify your account and get you sorted faster.",
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
            text: "Good news! Your account has been successfully reactivated. You can now log in and continue playing.",
          },
          {
            label: 'High Empathy',
            text: "Great news! Your account is active again! Go ahead and log in. We're right here if you need anything.",
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
            text: "For security purposes, phone number changes require identity verification. Please share your current registered number, the full name on the account, and your reason for the change and we'll assist from there.",
          },
          {
            label: 'High Empathy',
            text: "We understand and we want to make this as smooth as possible for you. To keep your account secure, we'll need to verify your identity before updating the number. Please share your current registered number, full name, and reason for the change.",
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
            text: "Following a review of your account activity, our team has identified a violation of our referral terms due to multiple accounts being created under the same identity to obtain the KSh 10 referral bonus. Based on checks including device verification, connection history, referral activity, and location data, withdrawals have been restricted. To restore withdrawal access, an account reset is required, which will clear all current funds. Please confirm if you agree to proceed.",
          },
          {
            label: 'High Empathy',
            text: "We understand this may be disappointing and we appreciate your patience. After reviewing your account, our system detected a referral policy violation involving multiple accounts under the same identity used to claim the KSh 10 bonus. Based on device, connection, referral, and location checks, withdrawals have been restricted. To restore access, an account reset is required and current funds will be cleared. Please confirm if you'd like to proceed.",
          },
          {
            label: 'Final Notice',
            text: "As previously advised, withdrawals remain restricted due to a confirmed referral policy violation. To restore access, an account reset is required. Please confirm your decision so we can proceed.",
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
            text: "Your account has been successfully reset. You can now log in and continue. Please ensure all future activity follows our referral and platform policies.",
          },
          {
            label: 'High Empathy',
            text: "Your account has been reset and is ready to go. Log in whenever you're ready. Please make sure future activity stays within our platform and referral rules to avoid any further restrictions. We're here if you need anything.",
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
            text: "We apologize for the inconvenience. The account reset feature is currently offline for system maintenance. Our technical team is actively working on it and access will be restored once the update is complete. Please check back shortly.",
          },
          {
            label: 'Alt A',
            text: "The account reset tool is temporarily unavailable due to ongoing technical maintenance. Our team is working to restore the reset feature as soon as possible. Thank you for your patience.",
          },
          {
            label: 'High Empathy',
            text: "We understand you want to reset your account and we apologize for the inconvenience. The account reset feature is currently undergoing technical maintenance and is temporarily offline. We appreciate your patience while our team works on restoring it.",
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
            text: "To delete your SofaBets account, follow these steps: 1 Visit sofabets.ke/delete-account 2 Go to Profile 3 Click DELETE Account 4 Select your Period of Exclusion 5 Click Continue To Delete Account 6 Type DELETE to confirm with no spaces 7 Then confirm deletion. Important: Avoid depositing or requesting OTP for at least 48 hours after confirming. Any account activity in that window will undo the process.",
          },
          {
            label: 'High Empathy',
            text: "We're sorry to see you go and we respect your decision completely. To close your account: Visit sofabets.ke/delete-account, Go to Profile, Click DELETE Account, Select your exclusion period, Click Continue, Type DELETE to confirm, Then confirm. Please avoid any deposits or OTP requests for at least 48 hours after confirming, otherwise the process will reverse itself.",
          },
          {
            label: 'Self-Exclusion Focused',
            text: "We respect and fully support your decision. To self-exclude: Visit sofabets.ke/delete-account, Profile, DELETE Account, Choose your exclusion period (temporary or permanent), Continue, Type DELETE, Confirm. Please avoid all account activity for 48 hours after confirming. We're proud of you for taking this step.",
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
            text: "Your account deletion request has been received and logged into our technical queue. We process closures in the order they arrive. Please allow up to 72 hours for the team to fully finalize the block on all reactivation features including OTPs. To avoid delays, please refrain from any account activity during this window.",
          },
          {
            label: 'High Empathy A',
            text: "Your request is in and we've logged it. Our team processes closures first come, first served, and yours is in the queue. Please allow up to 48 to 72 hours for the process to fully complete. In the meantime, please avoid depositing or requesting an OTP as doing so will undo the closure request.",
          },
          {
            label: 'High Empathy B',
            text: "We've received your request and it's being processed. We know waiting feels frustrating when you've made this decision, and we genuinely appreciate your patience. Please hold off on any account activity, including OTP requests and deposits, until the team fully completes the closure. This ensures nothing interrupts the process.",
          },
          {
            label: 'High Empathy C',
            text: "Your request is with us and being handled with care. Closures are processed in the order they arrive and your place in the queue is secured. Please avoid all account activity during this period. We'll confirm once the closure is fully finalized.",
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
            text: "It appears some account activity occurred during the closure processing window, which has interrupted the process. To proceed with the closure, please re-initiate the request from your account and then avoid all activity including deposits and OTP requests for the full 48 to 72 hour processing period.",
          },
          {
            label: 'High Empathy',
            text: "We understand this may be frustrating and we're sorry for the confusion. Any account activity such as depositing or requesting an OTP during the closure window automatically reverses the process. This is how the system works as a safeguard. To move forward, please re-initiate the closure request and avoid all account activity for the full 48 to 72 hour window. We're here to support you through this.",
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
            text: "Your account has been successfully closed. We're sorry to see you go and we wish you all the best. If you ever decide to return, you're always welcome at SofaBets.",
          },
          {
            label: 'High Empathy',
            text: "Your account has been fully closed. We hope your experience with us was a positive one overall. Please take care of yourself and remember that support is always here if you ever need anything. Wishing you well.",
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
            text: "We hear you and your wellbeing means everything to us. Please remember that betting should always stay within your limits. If you feel overwhelmed, we strongly encourage you to take a break. You can activate self-exclusion right now: Visit sofabets.ke/delete-account, Go to Profile, DELETE Account, Choose your exclusion period, Confirm. We're here for you.",
          },
          {
            label: 'High Empathy',
            text: "We're really glad you reached out and we hear you. Please take a breath. Your wellbeing is more important than any bet. You can step away at any time: Visit sofabets.ke/delete-account, Profile, DELETE Account, Select exclusion period, Confirm. We're proud of you for taking this step.",
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
            text: "We strongly advise against continuing to play to recover losses. This can increase risk significantly. Please take a break and only return when you feel calm and fully in control.",
          },
          {
            label: 'Response B',
            text: "It's important to pause and reassess right now. Chasing losses can lead to further losses and more stress. We can assist with self-exclusion or deposit limits if you'd like. Just say the word.",
          },
          {
            label: 'Response C',
            text: "For your safety and wellbeing, we don't encourage continued play to recover losses. If you need to step back, self-exclusion options are available and we'll guide you through it. You're not alone in this.",
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
            text: "To activate self-exclusion, here are the steps: Visit sofabets.ke/delete-account, Go to Profile, Click DELETE Account, Choose your exclusion period (temporary or permanent), Click Continue, Type DELETE to confirm, Then confirm deletion. Important: Avoid depositing or requesting OTP for at least 48 hours after confirming, otherwise the process will be undone.",
          },
          {
            label: 'High Empathy',
            text: "We respect and fully support your decision. To self-exclude: Visit sofabets.ke/delete-account, Profile, DELETE Account, Choose your exclusion period, Continue, Type DELETE, Confirm. Please avoid any account activity for 48 hours after confirming. We're genuinely proud of you for taking this step.",
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
            text: "Your well-being matters to us deeply. Betting should always be done responsibly and within your financial limits. If you ever need a break, self-exclusion or account closure is available at any time and we'll support you through it.",
          },
          {
            label: 'High Empathy',
            text: "We genuinely care about your well-being and we mean that. If betting ever starts to feel stressful or out of control, please consider taking a break or activating self-exclusion. We are always here to support you and you don't have to face this alone.",
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
            text: "We appreciate you reaching out. Please be advised that SofaBets does not offer refunds on completed bets or deposits unless a verified system error has occurred. We have reviewed your account and found no system faults.",
          },
          {
            label: 'Empathy',
            text: "We understand your frustration and we're sorry this hasn't gone the way you hoped. However, refunds on completed bets or deposits are only issued where a verified system error is confirmed. After a thorough review of your account, no faults were found.",
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
            text: "After a full review by our Technical and Risk teams, all transactions on your account were processed correctly. No discrepancies were found and no refund is applicable under our terms.",
          },
          {
            label: 'Response B',
            text: "We've carefully reviewed your account activity and everything was processed correctly. We're unable to issue a refund, but we're happy to walk you through the transaction breakdown if that would help.",
          },
          {
            label: 'Response C',
            text: "The review has been completed and our findings confirm no system error occurred. Refunds are only issued where a confirmed system fault is identified. This decision is final as per platform policy.",
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
            text: "We've shared our findings based on verified system data. If you have new information that hasn't been reviewed, we're happy to take another look. Otherwise the outcome remains final.",
          },
          {
            label: 'Response B',
            text: "At this stage the outcome is final based on verified records. We understand this may not be the answer you were hoping for and we genuinely appreciate your patience.",
          },
          {
            label: 'Response C',
            text: "We understand your position and we hear you. However, this decision is based on system logs and cannot be changed. If new information becomes available, please share it and we will review it right away.",
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
            text: "We understand your frustration and we take all concerns seriously. SofaBets operates in full compliance with the Betting Control and Licensing Board (BCLB) regulations. You are welcome to escalate through the appropriate channels and we will fully cooperate, providing complete account logs for any formal review.",
          },
          {
            label: 'Compliance Detail',
            text: "SofaBets operates in full compliance with the Betting Control and Licensing Board (BCLB) regulations. All transactions and bet histories are independently audited. You are welcome to escalate through the appropriate channels and we will fully cooperate by providing complete account logs for any formal review.",
          },
          {
            label: 'Brief',
            text: "We hear you. Our platform is fully audited and compliant. You are free to escalate through official channels and we will support any review with complete transparency.",
          },
          {
            label: 'Firm',
            text: "Our systems are fully auditable and compliant. We're confident in the review outcome and we welcome any formal review process.",
          },
          {
            label: 'Transparent',
            text: "You're welcome to escalate and we'll support the process fully. Our records clearly show the complete transaction flow and we will cooperate with any formal review without reservation.",
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
            text: "Following an internal review, irregular activity has been detected on this account. As a result, withdrawals have been temporarily restricted pending further investigation. We are unable to share full details of the investigation at this stage but will be in touch once the review is complete.",
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
            text: "Refund requests are subject to strict compliance review. Please provide all relevant documentation along with your registered phone number so our audit team can evaluate your case properly.",
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
            text: "The Sports Jackpot gives you a shot at winning KES 100,000 by landing 5 qualifying bets in a row within the same day. Each bet must have total odds of 7.00 or higher, a minimum cash stake of KES 50, and every selection must be at 1.30 odds or higher. Bets below these thresholds are ignored and don't count. All 5 wins must land on the same calendar day as the streak resets at midnight EAT. A losing qualifying bet resets your streak to zero. Cashed-out and voided bets are neutral. Wins are checked by our team and credited to your wallet once confirmed.",
          },
          {
            label: 'Alt A',
            text: "The Sports Jackpot awards KES 100,000 to players who win 5 qualifying bets in a row on the same day. Each bet must have total odds of at least 7.00, a cash stake of at least KES 50, and all individual selections must be at 1.30 odds or higher. Your streak resets at midnight EAT and any losing qualifying bet resets your streak to zero. Cashed-out or voided bets are neutral. Prizes are reviewed by our team and credited to your wallet.",
          },
          {
            label: 'High Empathy',
            text: "Great question about the Sports Jackpot! You have a shot at KES 100,000 by winning 5 qualifying bets consecutively within the same day. Each bet needs total odds of 7.00 or more, a minimum stake of KES 50, and every selection must be at least 1.30 odds. Bets below these thresholds simply don't count. All 5 wins must happen before midnight EAT when the streak resets. If a qualifying bet loses, the streak starts over. Cashed-out and voided bets don't affect your streak either way. Once you complete a winning streak, our team reviews and credits the prize to your wallet.",
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
            text: "For the Sports Jackpot, each qualifying bet must meet three criteria: total odds of 7.00 or higher, a minimum cash stake of KES 50, and every individual selection within the bet must be at odds of 1.30 or higher. Any bet that falls below these thresholds is simply ignored and doesn't count toward or against your streak.",
          },
          {
            label: 'Alt A',
            text: "To qualify for the Sports Jackpot, your bet must have total odds of at least 7.00, a cash stake of at least KES 50, and all selections must individually be at 1.30 odds or higher. Bets that don't meet these requirements are ignored and have no effect on your streak.",
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
            text: "All 5 Sports Jackpot wins must land on the same day. The streak resets at midnight EAT every day. A losing qualifying bet resets your streak to zero. Cashed-out and voided bets are neutral and will neither advance your streak nor reset it. Once you complete a winning streak, it is repeatable and a new streak begins on your next qualifying bet.",
          },
          {
            label: 'Alt A',
            text: "Your Sports Jackpot streak must be completed within a single day as it resets at midnight EAT. Losing a qualifying bet takes your streak back to zero. Voided or cashed-out bets don't count for or against you. After winning, the jackpot is repeatable and your next qualifying bet starts a fresh streak.",
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
            text: "The Bazooka Jackpot rewards players who cash out at 2.50x or higher for 7 consecutive qualifying rounds. Each round requires a minimum bet of KES 20 and your cashout must be at 2.50x or higher to count. If a round has several slots, only one slot needs to reach 2.50x for it to count as a round win. Any round that doesn't qualify resets your streak. The jackpot is repeatable, so your streak starts again after each win. The prize pool stands at the current live amount shown in the game.",
          },
          {
            label: 'Alt A',
            text: "To win the Bazooka Jackpot, cash out at 2.50x or higher for 7 rounds in a row, with a minimum bet of KES 20 per round. In rounds with multiple slots, only one slot needs to reach 2.50x to qualify. Any round that doesn't qualify resets your streak back to zero. Once you win, the streak resets and starts again on your next round.",
          },
          {
            label: 'High Empathy',
            text: "The Bazooka Jackpot is an exciting ongoing prize pool! To win it, you need to cash out at 2.50x or higher for 7 consecutive rounds, staking at least KES 20 per round. For rounds with multiple slots, just one slot reaching 2.50x is enough for that round to count. Any missed round resets your streak. The good news is that it is fully repeatable, so every time you win, a new streak can begin right away.",
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
            text: "For the Bazooka Jackpot, a qualifying round requires a minimum bet of KES 20 and a cashout at 2.50x or higher. In rounds with several slots, only one slot needs to reach 2.50x for the round to count. Any round that doesn't qualify resets your streak entirely. The jackpot is repeatable and a new streak begins immediately after each win.",
          },
          {
            label: 'Alt A',
            text: "Each Bazooka Jackpot round must have a stake of at least KES 20 and a cashout of 2.50x or higher. Multiple slots in one round count as a single round win, with only one slot needing to reach 2.50x. Missing the cashout threshold in any round resets the streak. Once completed, the jackpot can be won again starting from your very next round.",
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
            text: "The Early Payout feature lets you win before the match is over. With 1UP, your bet is paid out the moment your selected team goes 1 goal ahead, even if the opposing team equalizes later. With 2UP, your bet is paid out the moment your team goes 2 goals ahead. This applies to Match Result singles on eligible football games. Odds are slightly lower in exchange for the early-win safety net, and once the lead is hit the win is locked regardless of what happens after.",
          },
          {
            label: 'Alt A',
            text: "Early Payout is a feature that settles your bet before the final whistle. If you select 1UP, your bet is marked as a win the instant your team takes a 1-goal lead. With 2UP it's settled when they go 2 goals ahead. It works on Match Result singles for eligible football matches. Please note that odds are slightly reduced compared to standard bets, but once the qualifying lead is achieved, the win is locked in permanently.",
          },
          {
            label: 'High Empathy',
            text: "Great question about Early Payout! This feature is designed to give you peace of mind during live matches. 1UP means your bet is cashed as a winner the moment your team goes 1 goal ahead, no matter what happens after. 2UP works the same way but triggers when your team leads by 2 goals. It is available on Match Result singles for eligible football games. The trade-off is slightly lower odds, but once your team hits that lead, your win is secured immediately.",
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
            text: "1UP means your bet is automatically settled as a win the moment your selected team goes 1 goal ahead in an eligible match, regardless of the final result. Even if the opposing team scores later and the match ends in a draw or a loss, your bet has already been paid out as a win. It applies to Match Result singles on eligible football games, with odds slightly reduced in exchange for this early-win guarantee.",
          },
          {
            label: 'Alt A',
            text: "With 1UP, the moment your team takes a 1-goal lead in an eligible football match, your bet is instantly settled as a winner. The final result doesn't matter once the lead is reached. This is only available for Match Result singles and carries slightly reduced odds compared to a standard bet.",
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
            text: "2UP works just like 1UP but triggers when your team goes 2 goals ahead. The moment that 2-goal lead is reached in an eligible football match, your Match Result single is immediately settled as a win. Whatever happens after that point doesn't affect your payout. Odds are slightly lower than standard to account for the early-win advantage.",
          },
          {
            label: 'Alt A',
            text: "With 2UP, your bet is paid out as a win the instant your team leads by 2 goals in an eligible football game. Once that lead is secured, your winnings are locked in regardless of the final score. Like 1UP, this is available only on Match Result singles with slightly reduced odds.",
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
            text: "Please note that server seed hashes and related configurations are part of our internal security protocols and cannot be shared on request. The fairness system is independently managed and monitored in accordance with our platform policies and terms of service. We are unable to provide confidential cryptographic details for upcoming rounds.",
          },
          {
            label: 'Alt A',
            text: "We cannot provide any hacks, tips, or guarantees on how to trigger Aviator rains, nor can we disclose any specific account balance required for the same. Outcomes are determined by the game's mechanics and there is no guaranteed method to influence or predict them. We encourage you to enjoy our Aviator game and claim the rain once it pops up.",
          },
          {
            label: 'Alt B',
            text: "Please note that Aviator game outcomes are generated automatically by the game's system and are not manually controlled or selected by our team. The frequency of particular multipliers can vary from one game round to another, and previous outcomes do not determine the next one. We always encourage you to bet responsibly.",
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
            text: "Please note that if you are unsatisfied with the information provided, you may choose to self-exclude from our site in accordance with our responsible gaming policy. We kindly ask that all communication remains respectful.",
          },
          {
            label: 'Alt A',
            text: "We are here to assist you, but we kindly ask that all interactions remain respectful and professional. Should you continue to be dissatisfied, you are welcome to self-exclude in line with our responsible gaming policy.",
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
            text: "Please note your account remains active due to recent activity; consequently, the account has not been deleted. Permanent account deactivation takes up to 72 hours to process after self-exclusion. During this period, please refrain from making deposits or requesting OTPs, as any account activity may affect the deactivation process.",
          },
          {
            label: 'Alt A',
            text: "As advised, your request for account deletion has been received and is currently in the queue for processing. Kindly exercise patience to ensure a smooth account deactivation process. Please remember to engage in betting responsibly at all times.",
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
            text: "As long as you comply with our terms and policies, you will be able to make withdrawals without any issues. For your first withdrawal, your referral earnings must be at least Ksh 250. After you have made several deposits, the minimum amount for subsequent withdrawals is reduced to Ksh 50.",
          },
          {
            label: 'Alt A',
            text: "Please note that the minimum amount for your first withdrawal using referral earnings is Ksh 250. Once you have made several deposits, the minimum withdrawal threshold is lowered to Ksh 50, provided you remain compliant with our terms and policies.",
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
            text: "Please note that an account reset is not reversible. You previously requested an account reset after violating our terms and conditions; in accordance with our policies and regulations, all funds in your account were cleared once the reset was completed. Therefore no funds remained on the account following the reset.",
          },
          {
            label: 'Alt A',
            text: "As per our policies, an account reset results in the clearing of all account funds. Since the reset was initiated following a terms violation, the balance was cleared in line with standard procedures. We are unable to reinstate those funds.",
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
            text: "Please note that this is against our policies and regulations and is considered fraudulent activity. Any further suspicious activity on your account may result in its suspension. We kindly ask that you adhere to our policies to avoid any disruptions.",
          },
          {
            label: 'Alt A',
            text: "Offers of this nature are in direct violation of our terms of service and constitute fraudulent conduct. We are obligated to flag this interaction. We strongly advise you to refrain from such communications to avoid account suspension.",
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
            text: "Please note that your account was flagged for irregularities, and as a result the necessary action was taken, including the reversal of funds. Please be assured that this action was not taken maliciously and was carried out in accordance with our account review procedures.",
          },
          {
            label: 'Alt A',
            text: "Your account has been flagged for irregularities. As a result, certain account privileges including withdrawals have been suspended. Your account is still under active investigation and once concluded, you will be informed of the outcome.",
          },
          {
            label: 'Alt B',
            text: "Please note that the funds in your account cannot be withdrawn at this time, as the account was flagged for irregularities. To rule out any fraudulent activity and safeguard the integrity of the account, the necessary measures were taken including suspending the account and revoking withdrawal privileges. Once the review is concluded, you will be duly informed.",
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
            text: "Please note that we record all failed bets. Upon reviewing your account, we can confirm that no failed bets have been recorded. Should you have specific evidence, please share it so we can investigate further.",
          },
          {
            label: 'Alt A',
            text: "Our system records all bet activity. After reviewing your account, we can confirm there are no failed or unrecorded bets on our end. If you have further evidence or a specific transaction reference, please share it so we can investigate.",
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
            text: "Please note that we are not withholding your funds, as they were already disbursed from our end. There are no pending transactions on our side. We are here to assist you and are committed to providing the best possible service to all our clients.",
          },
          {
            label: 'Alt A',
            text: "Our review confirms that all your transactions were completed successfully and there are no pending transactions or funds on our end.",
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
            text: "We sincerely apologize for the delay in processing your account closure. Please be assured that we are actively working to ensure your data is completely removed from our servers. We appreciate your patience and understanding during this process.",
          },
          {
            label: 'Alt A',
            text: "Please note that account deactivation is a procedural process and the clearance of account data cannot be completed within one day. Kindly allow the process to be completed in accordance with our Terms and Conditions. Once complete, you will be duly informed.",
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
            text: "Please note this is a global issue and hence no stipulated timeline has been accorded. We are working as fast as possible to resolve the matter. Kindly bear with us.",
          },
          {
            label: 'Alt A',
            text: "The delay you are experiencing is due to a system-wide issue currently being addressed. We do not have a confirmed resolution timeline at this stage but our team is working urgently to restore full service. We appreciate your patience.",
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
            text: "Please note that you are required to make a deposit before you can participate in any games. Depositing enables you to place bets and have a chance to win, subject to the outcome of the games.",
          },
          {
            label: 'Alt A',
            text: "Please note that your account is still under review as it has been flagged for irregularities. Your ticket has not been attended to yet. We appreciate your patience and will provide an update once the review is complete.",
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
            text: "Please note that once you make a referral, your account may be subject to review before any withdrawals are processed. This is a standard verification measure to prevent discrepancies and fraudulent activities.",
          },
          {
            label: 'Alt A',
            text: "Referral-related withdrawals are subject to a standard account review before processing. This is a routine step to ensure compliance and prevent fraudulent activity. We will notify you once the review is complete.",
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
            text: "Your case has been successfully resolved. Thank you for your patience and cooperation throughout the process. Should you require any further assistance, please do not hesitate to contact us.",
          },
          {
            label: 'Alt A',
            text: "We are pleased to inform you that your case has been fully resolved. We appreciate your patience. Should any further concerns arise, our team is always available to assist.",
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
            text: "Please note that we do not have access to your account and are therefore unable to manipulate or alter any account data. If you have a screenshot of the winning bets, we would gladly review it and, where applicable, credit your account accordingly.",
          },
          {
            label: 'Alt A',
            text: "Our support agents do not have the ability to modify, edit, or alter account data in any way. If you believe there has been an error, please share the relevant evidence and we will escalate for investigation.",
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
            text: "Please note that the transaction shown does not match our records. Kindly refrain from sharing altered or fraudulent transaction details. If you believe there has been an error, please provide the correct transaction details so that we can investigate further.",
          },
          {
            label: 'Alt A',
            text: "After cross-referencing your submission against our records, the transaction provided does not appear to be authentic. We strongly advise against sharing falsified information. Should you have a legitimate query, please provide accurate transaction details for review.",
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
            text: "Yes, Ksh 250 is the minimum amount required for your first withdrawal when using referral earnings. Kindly ensure your referral earnings meet the minimum before initiating a withdrawal.",
          },
          {
            label: 'Alt A',
            text: "For first-time withdrawals via referral earnings, the minimum threshold is Ksh 250. Once this is met and your account is in good standing, you may proceed to request your withdrawal.",
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
            text: "For an accurate transaction history, kindly request a full M-PESA statement directly from Safaricom and also check your bet history on your account. Please note that we are unable to provide this information from our end as we do not have access to your personal account details.",
          },
          {
            label: 'Alt A',
            text: "Your full transaction history is accessible directly through your account dashboard. For M-PESA records, please request a statement from Safaricom. We are unable to provide personal account statements from our end in line with our data protection policy.",
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
            text: "There is no need to follow up regarding cashback, as it is credited automatically by the system. If you were not eligible for cashback yesterday, this was not a clerical error. As previously explained, you will receive your cashback at 8:35 PM once the reset window has passed. Kindly review your transaction history to confirm the timing of your deposit.",
          },
          {
            label: 'Alt A',
            text: "Please note that even if the amount you deposited equals the amount you withdrew, this does not automatically qualify you for cashback. Cashback is only applicable when you are on a net loss, in accordance with the cashback terms and conditions.",
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
            text: "Please note that penalties are not counted as winnings because the game itself would have already concluded at the end of regular play. Penalties are part of the additional time and procedure and therefore do not form part of the winning outcome for settlement purposes.",
          },
          {
            label: 'Alt A',
            text: "For settlement purposes, the outcome of a match is determined at the end of regular time, unless the market specifically includes extra time or penalties. Penalty shoot-outs are considered a separate procedure and are not included in standard match result settlements.",
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
            text: "Please note that we have not experienced any security breaches. If you have any evidence indicating otherwise, please feel free to share it with us for further review. We take the security and protection of our clients' data seriously and have measures in place to safeguard their information.",
          },
          {
            label: 'Alt A',
            text: "Please be assured that the security and confidentiality of our clients' data is a top priority. We have not identified any breach on our end. Should you have specific evidence or concerns, we encourage you to share them so we can review and respond accordingly.",
          },
        ],
      },
    ],
  },
];
