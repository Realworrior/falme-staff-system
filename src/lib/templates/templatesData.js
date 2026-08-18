export const TEMPLATES_DATA = [
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
            text: "Hello. You're now connected with our support team. Please go ahead and share what you need help with and we'll get right on it.",
          },
          {
            label: 'Alt A',
            text: "Hi there. We're ready to help. Tell us what's going on and we'll get it sorted straight away.",
          },
          {
            label: 'Alt B',
            text: "Hello. Good to hear from you. Let us know what the issue is and we'll take it from here.",
          },
          {
            label: 'Alt C',
            text: "Hi. Our support team is with you. Please share your issue so we can assist right away.",
          },
          {
            label: 'High Empathy',
            text: "Hello. Don't worry, whatever the issue is, we'll work through it together. Go ahead and tell us what happened.",
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
            text: "Hello. To get this sorted quickly, please share your registered phone number, and a brief description of the issue. We'll take it from there.",
          },
          {
            label: 'Alt A',
            text: "Hi. Happy to help. Kindly send us your registered phone number and tell us what the problem is so we can get started.",
          },
          {
            label: 'Alt B',
            text: "Hello. We're here. Please share your account number and describe what's happening so we can look into it right away.",
          },
          {
            label: 'Alt C',
            text: "Hi. We'd like to help. Send your phone number and explain what's going on so we can check immediately.",
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
            text: "We understand this is urgent and we're on it. To check immediately, please share your registered phone number, the amount, and the exact time of the transaction.",
          },
          {
            label: 'Alt A',
            text: "We're on it right now. Please send your phone number, the amount, and the exact time so we can prioritize your case immediately.",
          },
          {
            label: 'Alt B',
            text: "Your concern is our priority. Share your phone number, the amount, and the transaction time and we'll get back to you without delay.",
          },
          {
            label: 'High Empathy',
            text: "We hear you and we want to resolve this as fast as possible. Please send your registered number, the amount, and the exact time and we'll check straight away.",
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
            text: "We understand you may be frustrated and we genuinely want to help resolve your issue. Kindly keep the conversation respectful so we can assist you as effectively as possible. Please share what happened.",
          },
          {
            label: 'Alt A',
            text: "We're here to help and we take your concern seriously. Please share your issue calmly so we can work on a solution together right away.",
          },
          {
            label: 'Alt B',
            text: "We understand frustration happens and we want to fix this for you. Please explain what happened and we'll do our best to assist.",
          },
          {
            label: 'Firm Boundary',
            text: "We want to assist you and will do everything we can to resolve your issue. However, respectful communication is required for us to continue. Please share your concern and we'll get started immediately.",
          },
          {
            label: 'High Empathy',
            text: "We hear you and we truly want to help. Please let us know what happened and we'll work through this together. Just keep it friendly so we can give you our full attention.",
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
            text: "Thank you for choosing Betfalme. We're glad your issue has been resolved. Feel free to reach out anytime you need us.",
          },
          {
            label: 'Alt A',
            text: "All sorted. Thanks for your patience. We're always here if you need anything else.",
          },
          {
            label: 'Alt B',
            text: "Happy to help. Your account is in order. Don't hesitate to get in touch anytime.",
          },
          {
            label: 'Alt C',
            text: "Everything is resolved. Thank you for reaching out. Betfalme support is always here for you.",
          },
          {
            label: 'High Empathy',
            text: "We really appreciate your patience throughout this. We're happy everything is sorted. Take care and enjoy the game.",
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
            text: "You can reach our live support team directly anytime at https://blastchat.chat/chat/falmebet. Connect with an agent for instant assistance.",
          },
          {
            label: 'Alt A',
            text: "To chat directly with our live support agents, please visit https://blastchat.chat/chat/falmebet. We'll be ready to assist you immediately.",
          },
          {
            label: 'High Empathy',
            text: "We want to get this resolved for you right away. You can connect directly with our live support team at https://blastchat.chat/chat/falmebet. We're here for you!",
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
        id: '2.1',
        title: 'Failed Deposit - M-PESA Code Required',
        triggers: 'deposit failed, not reflected, not showing, deposited, funds not showing',
        variants: [
          {
            label: 'Standard',
            text: "We're sorry to hear your deposit hasn't reflected. We can sort this out quickly. Please send us your registered phone number, and the 10-character M-PESA transaction code from your SMS, for example UA58134GTJ. Please share the code as text only, not a screenshot, and note that mini-statement codes are not accepted.",
          },
          {
            label: 'Alt A',
            text: "No worries, we'll get this sorted. Kindly send your phone number, and the 10-character code from your M-PESA message, for example UA58134GTJ. Text only please, no screenshots. We'll verify and update your balance right away.",
          },
          {
            label: 'Alt B',
            text: "To trace your deposit we need two things: your registered phone number, and the M-PESA transaction code from your SMS. It's a 10-character code, for example UA58134GTJ. Text only, no screenshots, no mini-statement codes.",
          },
          {
            label: 'High Empathy',
            text: "We understand how frustrating a missing deposit can be and we'll get this fixed for you. Please share your phone number, and the 10-character code from your M-PESA confirmation SMS, for example UA58134GTJ. Text only, no screenshots needed. We're on it.",
          },
        ],
      },
      {
        id: '2.2',
        title: 'Client Shares Mini-Statement Code',
        triggers: 'mini statement, last 5 transactions, one code for all, combined code',
        variants: [
          {
            label: 'Standard',
            text: "Thanks for sharing that. However, the code you've sent appears to be a mini-statement code, which covers multiple transactions and cannot be used for individual verification, We need the specific 10-character M-PESA code from the deposit SMS, for example UA58134GTJ. Kindly check your messages and send that code as text.",
          },
          {
            label: 'Alt A',
            text: "That looks like a mini-statement code covering several transactions at once and unfortunately our system can only verify individual codes, Please check your M-PESA SMS for the specific deposit message and send us the 10-character code from that message, for example UA58134GTJ.",
          },
          {
            label: 'High Empathy',
            text: "No worries, this is a common mix-up and we're happy to clarify. The code you've sent is a mini-statement code covering multiple transactions. We need the individual 10-character code from the specific deposit SMS, for example UA58134GTJ. Please check your messages and send that one over.",
          },
        ],
      },
      {
        id: '2.3',
        title: 'Deleted M-PESA Message',
        triggers: "deleted mpesa, deleted message, can't find code, no sms",
        variants: [
          {
            label: 'Standard',
            text: "Not a problem. You can recover the transaction code in two ways, Open your M-PESA app and check your transaction history for the 10-character code, or contact Safaricom directly and request a full M-PESA statement. Please note that mini-statement codes are not accepted.",
          },
          {
            label: 'Alt',
            text: "No worries. The transaction code can still be found, check your M-PESA app under transaction history, or reach out to Safaricom for a full statement. Just note that mini-statements won't work for verification.",
          },
        ],
      },
      {
        id: '2.4',
        title: 'Client Self-Check - Deposit Unsuccessful Option',
        triggers: 'how to check, deposit unsuccessful, verify code, footer',
        variants: [
          {
            label: 'Standard',
            text: "You can also verify your deposit directly from the platform. Here's how, Open your account, Scroll to the footer, Tap 'Deposit Unsuccessful?', Enter the 10-character code from your M-PESA SMS, for example SJ82KFNAX4. Quick and easy.",
          },
          {
            label: 'Alt',
            text: "There's a quick self-check option built into the platform. Go to your account, scroll down to the footer, tap 'Deposit Unsuccessful?', and enter the 10-character M-PESA code from your deposit SMS. You'll get an instant update.",
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
            text: "Unfortunately our platform does not support Bonga Points deposits. Each account is only linked to one registered M-PESA number and our system cannot credit payments made via Bonga Points. You will need to contact Safaricom directly to initiate a reversal. Please call Safaricom on 100 or send a WhatsApp message to 0722000100 to request the reversal. Once the funds are back, you can deposit using your registered M-PESA number.",
          },
          {
            label: 'Alt A',
            text: "Bonga Points are not accepted as a deposit method on our platform. Because our system only recognises direct M-PESA transactions linked to your registered number, Bonga Point payments cannot be credited to your account. To get your funds back, please reach out to Safaricom on 100 or WhatsApp 0722000100 and request an official reversal.",
          },
          {
            label: 'High Empathy',
            text: "We are sorry for the inconvenience. Unfortunately Bonga Points cannot be used to fund your account as we only support standard M-PESA deposits from your registered number. Please contact Safaricom immediately on 100 or WhatsApp 0722000100 to reverse the transaction. Once reversed, you are welcome to re-deposit using M-PESA and we will get you sorted right away.",
          },
          {
            label: 'Plain Language',
            text: "Bonga Points do not work for deposits here. Our system only reads regular M-PESA payments from the phone number you registered with. Please call Safaricom on 100 or WhatsApp 0722000100 to get your points back. After the reversal is done, deposit again using your normal M-PESA.",
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
            text: "Airtel Money is not a supported deposit method on our platform. Our system only accepts M-PESA payments linked to your registered number, so Airtel Money transactions cannot be credited to your account. Please contact Airtel immediately to initiate a reversal. Call Airtel customer care on 100 or send an email to airtelmoney@airtel.com. Once reversed, please deposit using your registered M-PESA number.",
          },
          {
            label: 'Alt A',
            text: "We are sorry but we do not accept Airtel Money deposits. Because our platform only supports M-PESA from your registered number, any Airtel Money payment sent to us cannot be credited. To recover your funds, call Airtel on 100 or email airtelmoney@airtel.com and request an official reversal. You can then re-deposit via M-PESA.",
          },
          {
            label: 'High Empathy',
            text: "We completely understand this is frustrating and we want to help you resolve it quickly. Airtel Money is not supported on our platform, which means the payment cannot be credited to your account. Please reach out to Airtel right away on 100 or email airtelmoney@airtel.com to request a reversal. Once your funds are back, you can deposit using M-PESA and we will assist you from there.",
          },
          {
            label: 'Plain Language',
            text: "Airtel Money does not work for deposits on our platform. We only accept M-PESA from the phone number linked to your account. Please call Airtel on 100 or email airtelmoney@airtel.com to get your money back. Once reversed, deposit again using M-PESA.",
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
            text: "If you paid into our Paybill or Till by mistake, or deposited from a number not registered to your account, Betfalme cannot manually reverse the transaction. Our system only credits M-PESA payments from the specific number registered to your account, so transactions from any other number or via merchant payment cannot be applied. Please initiate an official Safaricom reversal immediately by forwarding your payment SMS to 457 or by calling Safaricom on 100.",
          },
          {
            label: 'Alt A',
            text: "We are unable to manually reverse payments made to our Paybill or Till, or from an unregistered number. Your account is linked to a single M-PESA number and only payments from that specific number are accepted. Please contact Safaricom right away to initiate a reversal. You can forward the payment SMS to 457 or call 100. If you used the MySafaricom App, a reversal can also be requested there.",
          },
          {
            label: 'High Empathy',
            text: "We understand this is stressful and we are genuinely sorry for the inconvenience. Unfortunately Betfalme cannot process or manually reverse payments made to our Paybill or Till from an unregistered number. Our system only accepts M-PESA from the exact number linked to your account. Please act quickly and contact Safaricom to request a reversal by forwarding your payment SMS to 457 or calling 100. We hope to have you sorted as soon as possible.",
          },
          {
            label: 'Plain Language',
            text: "Your deposit did not go through because the payment was made to our Paybill or Till using a number that is not linked to your account. Our system can only accept M-PESA deposits from the specific phone number you registered with. We cannot reverse this on our side. Please contact Safaricom immediately to get your money back. You can forward the M-PESA SMS you received to 457, call Safaricom on 100, or reverse it directly from the MySafaricom App.",
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
            text: "We want to reassure you straight away - your funds are safe. We're currently aware of a temporary delay from the Safaricom network affecting some M-PESA deposits. This is not a Betfalme issue and everything will reflect automatically once the network is fully restored. We appreciate your patience.",
          },
          {
            label: 'Alt A',
            text: "Your money is safe and accounted for. There's a temporary delay on Safaricom's end affecting some deposits right now. Everything will come through automatically once service is restored. We're monitoring it closely.",
          },
          {
            label: 'High Empathy',
            text: "We completely understand how stressful a delayed deposit can be and we want to put your mind at ease. The delay is on Safaricom's end, not ours. Your money is safe, and will reflect as soon as the network is back to normal. Thank you for your patience.",
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
            text: "We're sorry for the delay. We're currently seeing some slowness with M-PESA deposits. Please share your registered phone number, and the M-PESA transaction code from your SMS and we'll manually verify and update your balance right away.",
          },
          {
            label: 'High Empathy',
            text: "Sorry about the wait and we completely understand your frustration. M-PESA is experiencing slight delays right now. Please send your phone number and the transaction code from your M-PESA SMS and we'll get your balance updated immediately.",
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
            text: "Your Betfalme account is linked to one specific M-PESA number only. This is the number you registered with. Our system can only accept deposits sent directly from that exact number. Payments made using Bonga Points, Airtel Money, or sent to our Paybill or Till from a different number are not recognised by our system and cannot be credited to your account. This is why we are unable to add the funds manually.",
          },
          {
            label: 'Plain Language',
            text: "Think of it like this: your Betfalme account is connected to only one M-PESA number, the one you signed up with. Our system checks every deposit and only accepts money that comes directly from that same number. Bonga Points, Airtel Money, or payments made to our Paybill or Till from a different number are like sending money to the wrong address. Our system does not see them and cannot add them to your balance. That is why you need to reverse the payment and send it again the right way, directly from your registered M-PESA number.",
          },
          {
            label: 'Alt A',
            text: "Each account on our platform is tied to a single registered M-PESA number. Our system only accepts deposits from that exact number. Bonga Points and Airtel Money are different payment systems that our platform does not recognise, so they cannot be credited. Similarly, payments made to our Paybill or Till from a number that is not registered to your account will not reflect. In all of these cases, you will need to contact your provider to reverse the funds and then re-deposit using your registered M-PESA number.",
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
            text: "Your Betfalme account is linked to one specific M-PESA number only. This is the number you registered with. Our system can only accept deposits sent directly from that exact number. Because the deposit was sent from an unregistered line, the funds cannot reflect automatically on your current account. To resolve this, kindly create a new Betfalme account using that specific phone number that made the deposit. Once registered, share the M-PESA confirmation message with us here and we will immediately verify and ensure the funds reflect in your account.",
          },
          {
            label: 'Alt A',
            text: "Our system is designed to only credit deposits made from the phone number registered to your Betfalme account. If you deposited using a different or unregistered number, the funds cannot be added to your current profile. We advise you to register a Betfalme account with the number that made the payment. Once registered, send us the full M-PESA SMS received from that transaction and our support team will verify and credit your balance right away.",
          },
          {
            label: 'High Empathy',
            text: "We completely understand your concern and we are here to help you get your funds credited smoothly. Each Betfalme account is tied to one specific M-PESA number, so payments coming from an unregistered number do not credit automatically. The easiest way to access your money is to register an account on Betfalme using the exact phone number the deposit came from. After completing the registration, please share the M-PESA payment SMS with us and we will promptly verify the transaction so you can enjoy your funds.",
          },
          {
            label: 'Plain Language',
            text: "Your Betfalme account only connects to the exact phone number you signed up with. If you sent money from another SIM card or someone else's number, our system cannot put it into your current account. Here is the simple fix: Go ahead and register a new Betfalme account using that phone number that made the payment. Once you have created the account, copy and paste the M-PESA message from that transaction to us here. We will check it immediately and confirm your funds.",
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
            text: "We understand how worrying this is and we'll trace it right away. Please share your registered phone number, the withdrawal amount, and the exact time you made the request.",
          },
          {
            label: 'Alt A',
            text: "We're on it. Please send your phone number, withdrawal amount, and the exact time of the request and we'll check immediately.",
          },
          {
            label: 'Alt B',
            text: "To trace your withdrawal we need three things from you: your phone number, the amount withdrawn, and the exact time of the request. Send those over and we'll get on it.",
          },
          {
            label: 'High Empathy',
            text: "We hear you and we want to get this resolved quickly. Please send your registered phone number, the amount, and the exact time of the withdrawal and we'll get straight on it.",
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
            text: "Most withdrawals clear within minutes. If yours has been pending for over 30 minutes, please share your phone number, the amount, and the exact request time so we can escalate this right away.",
          },
          {
            label: 'High Empathy',
            text: "We know how stressful it is when your money isn't moving and we're sorry for the wait. If it's been over 30 minutes, please send your phone number, the amount, and the time of the request and we'll make this a priority.",
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
            text: "We're sorry to hear that. To trace this, please first confirm your M-PESA number is registered and active, then share your phone number, the withdrawal amount, and the exact time of the request and we'll investigate immediately.",
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
            text: "We're sorry to hear you're having trouble withdrawing. Please share your registered phone number so we can check your account status and work on getting access restored for you right away.",
          },
          {
            label: 'Alt A',
            text: "There may be a restriction on your account. Kindly send your registered phone number and we'll review the status immediately and assist from there.",
          },
          {
            label: 'High Empathy',
            text: "We understand how frustrating this is and we want to fix it for you. Please send your registered phone number so we can check what's happening and work on restoring your withdrawal access as quickly as possible.",
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
            text: "Thank you for your patience. Please note that withdrawals above KSh 100,000 are processed in batches on our system, This can cause a slight delay compared to standard withdrawals. To avoid this in future, we'd recommend splitting large withdrawals into amounts of KSh 100,000 or less. Your funds are safe, and will come through once the batch processes.",
          },
          {
            label: 'Alt A',
            text: "Our system processes withdrawals above KSh 100,000 in batches, which can take a little longer than usual. Your funds are secure and will reflect once the batch clears. To avoid delays in future, try withdrawing in amounts below KSh 100,000 at a time.",
          },
          {
            label: 'High Empathy',
            text: "We understand waiting on a large withdrawal can feel very stressful and we want to reassure you. Amounts above KSh 100,000 are processed in batches on our end, which can take a bit longer. Your funds are safe, and will reflect once the batch clears. Going forward, splitting into amounts below KSh 100,000 will keep things moving faster for you.",
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
            text: "Just a quick note on this. The KSh 250 minimum applies only to first-time withdrawals using the referral bonus without a prior deposit, Once you complete that first withdrawal, the minimum drops to KSh 50 for all future withdrawals.",
          },
          {
            label: 'Alt A',
            text: "Your first referral bonus withdrawal requires a minimum balance of KSh 250. Once that first one is done, the limit becomes KSh 50 going forward.",
          },
          {
            label: 'Impatient Client',
            text: "Almost there. Once your balance reaches KSh 250, your withdrawal will open up immediately. Top up or keep playing and you'll get there.",
          },
          {
            label: 'Firm / Policy',
            text: "We understand this may feel restrictive and we appreciate your patience. The KSh 250 threshold applies to first-time referral bonus withdrawals as per our policy. Once you cross that mark, the minimum becomes KSh 50 for everything that follows.",
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
            text: "Your current balance is below the KSh 50 minimum withdrawal amount, Kindly top up or keep playing until you reach that amount and you'll be good to go.",
          },
          {
            label: 'Alt',
            text: "Withdrawals require a minimum of KSh 50 in your account. Once you hit that mark, you can withdraw immediately.",
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
            text: "Good news. Your account is eligible for withdrawal. You may go ahead and proceed at your convenience.",
          },
          {
            label: 'Alt A',
            text: "Great news. Everything checks out and you can now withdraw whenever you're ready.",
          },
          {
            label: 'Alt B - Retention',
            text: "You're all set to withdraw. Feel free to proceed or keep playing if you prefer. Your call!",
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
            text: "We're sorry for the inconvenience. We are currently experiencing some delays with M-PESA withdrawals. Our technical team is actively working with the provider to get this resolved as quickly as possible. We appreciate your patience.",
          },
          {
            label: 'Alt A',
            text: "We're sorry for the inconvenience. We are currently experiencing some delays with M-PESA withdrawals. Our technical team is actively working with the provider to resolve this as quickly as possible. Your funds are safe, and we appreciate your patience.",
          },
          {
            label: 'High Empathy',
            text: "We completely understand how frustrating it is when your money isn't moving and we sincerely apologize for the delay. Our team is already on it and working to get withdrawals flowing again as fast as possible. Thank you for staying with us.",
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
            text: "We can check this for you. Please send your phone number, the crash game name, the amount lost per slot, and the exact time of the error. Each round must be reported separately.",
          },
          {
            label: 'High Empathy',
            text: "We understand how frustrating an unexpected error during a game can be and we take this seriously. Please share your phone number, the specific crash game, the amount lost per round, and the exact time it happened. List each round separately and we'll investigate right away.",
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
            text: "Let's get this sorted quickly. Please send your phone number, a Bet History screenshot with the winning round visible, the cashout time, and the amount won.",
          },
          {
            label: 'High Empathy',
            text: "We understand this is concerning and you deserve to see those winnings in your wallet. Please send your phone number, a screenshot from your Bet History showing the won round, the cashout time, and the amount. We'll get this sorted as fast as possible.",
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
            text: "We're sorry for the interruption. The game is currently unavailable globally due to a technical issue on the provider's side. We're monitoring the situation closely and access will be restored as soon as the provider resolves it. Thank you for your patience.",
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
            text: "We can look into this for you. Please send your phone number, the virtual game name, the amount lost, and the exact time of the error. List each round separately and do not combine amounts.",
          },
          {
            label: 'High Empathy',
            text: "We understand how upsetting an unexpected loss during a game can be. Please share your phone number, the virtual game name, the amount lost per round, and the exact time. We'll investigate and get back to you as soon as possible.",
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
            text: "Upon investigating your account and gameplay logs, we have confirmed that the cashout and winnings for that round were settled and credited correctly to your balance at the time of play. Please recheck keenly your transaction history and account balance logs around that exact timeframe.",
          },
          {
            label: 'Alt A',
            text: "We have thoroughly checked your gaming session logs. The transaction was successfully completed and your winnings were added directly to your wallet at that time. Kindly review your transaction history keenly to see the update.",
          },
          {
            label: 'High Empathy',
            text: "We understand why you wanted this checked and we have reviewed your full gaming logs carefully. We can confirm that your cashout was settled correctly and credited to your wallet in real time during your play. We kindly advise you to recheck your transactions around that time.",
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
            text: "We'll look into this right away. Please share your registered phone number, and the Bet ID, for example #678534. A screenshot of the betslip would also be helpful if you have one.",
          },
          {
            label: 'Alt A',
            text: "We're on it. Please send your phone number and the Bet ID (e.g. #678534). Attach a betslip screenshot if available and we'll review without delay.",
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
            text: "No need to worry about this one. Postponed matches typically take up to 48 hours after the original scheduled time for bookmakers to officially settle. Your betslip will update automatically once that's done and no action is needed on your end.",
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
            text: "Following a detailed investigation by our Technical and Risk Management teams, we have confirmed that the bet in question was placed after the match had already started, Under our betting rules and T&Cs, all wagers must be placed before the official kick-off unless the market is specifically offered as in-play. As the event had already commenced when the bet was accepted, the betslip has been identified as irregular and has been voided. This decision is final.",
          },
          {
            label: 'Shorter Version',
            text: "After a thorough review, it was confirmed that this bet was placed after the match had already kicked off, Per our betting rules, all bets must be placed before kick-off unless it's an in-play market. The bet has been voided and this decision is final.",
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
            text: "Odds are locked in at the exact moment you submit your bet, they can shift right up until that point. Please share your phone number and Bet ID so we can pull up exactly what was recorded at submission time.",
          },
          {
            label: 'High Empathy',
            text: "We understand this can be confusing and we're happy to check it for you. Odds are locked at the precise moment of submission. Kindly share your phone number and Bet ID and we'll pull up exactly what was recorded.",
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
            text: "We're sorry that happened. Bets can be declined for a few reasons, the market may have closed before submission, odds may have shifted during loading, or the stake may exceed the limit for that market. Please share your phone number and a screenshot of the error message so we can investigate.",
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
            text: "We're currently upgrading our live betting feature to improve your experience, We apologize for the inconvenience and will let you know as soon as it's back online. Thank you for your patience.",
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
            text: "Great question. Here's what Betfalme currently offers, Tax-free bets, 10% daily cashback on losses, Unlimited rains on Aviator, KSh 10 referral bonus, 5% referral income, 20% cashback on sports bets, Free bet when you refer an eligible user. Keep an eye on the platform for new promos!",
          },
          {
            label: 'High Empathy',
            text: "We love this question. Betfalme has some great offers running. You get, Tax-free bets, 10% daily cashback on losses, Unlimited Aviator rains, KSh 10 per referral, 5% referral income, 20% sports cashback, and a free bet for each eligible referral. Stay tuned for even more!",
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
            text: "The deposit bonus was a limited-time offer and has already been fully claimed. Please stay tuned for upcoming promotions though - more great offers are on the way.",
          },
          {
            label: 'High Empathy',
            text: "We understand this may be disappointing and we're sorry you missed that one. That bonus was time-limited and has already been fully redeemed. Don't worry though - more promotions are coming up. Keep an eye on the platform.",
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
            text: "Aviator Rains are random promotional credits dropped in the Aviator game chat, They're available to players who are actively in the game at the time of the drop. There's no way to manually request a Rain, so just stay active and the next one could land on you!",
          },
          {
            label: 'High Empathy',
            text: "Rains are exciting and we love them too. They're randomly dropped in the Aviator chat for active players. No way to request one manually, so just keep playing and stay in the game. The next rain could be heading your way,",
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
            text: "Your cashback is calculated automatically and credited daily at 8:35 PM. If you recorded a net loss during the cashback period and are eligible, it will reflect in your account after that time. No manual request is needed.",
          },
          {
            label: 'Alt A',
            text: "Cashback is processed every day at 8:35 PM. If your deposits were more than your withdrawals during the period, it'll reflect automatically. Just check your balance after 8:35 PM.",
          },
          {
            label: 'Firm / Impatient Client',
            text: "Cashback is not instant, It is calculated once daily at 8:35 PM. If you're eligible based on your activity, it will appear automatically in your account. No action required.",
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
            text: "Cashback is credited only when your total deposits during the cashback period are higher than your total withdrawals, resulting in a net loss, If your withdrawals were equal to or higher than your deposits, no cashback will be generated. This is all calculated automatically by the system.",
          },
          {
            label: 'Alt A',
            text: "For cashback to be generated, your deposits must exceed your withdrawals within the cashback period. If there's no net loss, the system won't create a cashback entry. It's fully automatic.",
          },
          {
            label: 'Firm',
            text: "No net loss means no cashback, The system calculates this automatically every day. If your withdrawals matched or exceeded your deposits during the period, no cashback is issued.",
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
            text: "Here's how cashback works. The window runs from 8:35 PM yesterday to 8:35 PM today. The formula is, Total Deposits minus Total Withdrawals = Net Loss, 10% of Net Loss = your Cashback. For example, Deposit KSh 1,000, Withdraw KSh 600, Net Loss = KSh 400, Cashback = KSh 40. Simple as that!",
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
            text: "You'll receive cashback today at 8:35 PM if your deposits between 9:00 PM yesterday and 8:35 PM today were higher than your withdrawals and your account shows a net loss. It's all calculated automatically and no action is needed from your end.",
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
            text: "Happy to explain this. Our cashback system runs a 10-minute reset window between 8:30 PM and 8:40 PM daily. Any deposits made during that specific window may not be captured in the current 24-hour cycle. This prevents synchronization errors during the daily reset. Deposits before or after that window will be counted normally.",
          },
          {
            label: 'High Empathy',
            text: "Great question and we're glad you asked. Between 8:30 PM and 8:40 PM, our system performs a daily reset. Deposits made in that 10-minute window aren't always counted in the immediate cashback cycle because the system needs a clean slate to calculate correctly. Deposits outside that window are counted as normal. Thank you for your patience while we keep things accurate!",
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
            text: "Your case has been submitted to our Technical Team for review. We'll update you as soon as we receive feedback. Thank you for your patience.",
          },
          {
            label: 'Alt A',
            text: "Your request is now under technical review. We'll notify you once it's been processed. Sit tight and we'll be in touch.",
          },
          {
            label: 'Alt B',
            text: "We've escalated your issue and it's currently being handled by our team. We'll share an update as soon as it's available.",
          },
          {
            label: 'Alt C',
            text: "Your case is already in progress with our Technical Team, we'll get back to you the moment it's done.",
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
            text: "We've received your password reset request and it has been filed as a ticket. Our team will process it in the order received. Please keep an eye on your registered contact details for the reset notification.",
          },
          {
            label: 'Alt A',
            text: "Your password reset request has been logged and is in our queue. We'll process it as soon as we can. Thank you for your patience.",
          },
          {
            label: 'High Empathy',
            text: "We understand it's frustrating to be locked out and we want to get you back in as soon as possible. Your password reset request has been filed and our team will get to it shortly. Please check your registered contact for the notification once it comes through.",
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
            text: "Good news. The amount has been successfully rolled back to your account. Please refresh and confirm your balance has updated.",
          },
          {
            label: 'Alt A',
            text: "Your funds are back. Please refresh your account and check that everything reflects correctly.",
          },
          {
            label: 'Alt B',
            text: "All sorted. The amount has been credited back to your account. Refresh and confirm your balance.",
          },
          {
            label: 'High Empathy',
            text: "Great news and we're so glad we could sort this out for you. Your funds have been successfully returned to your account. Please refresh and let us know if everything looks correct.",
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
            text: "We're sorry to hear you can't access your account. Please share your registered phone number so we can check the account status and assist with restoring access right away.",
          },
          {
            label: 'Reset Flow',
            text: "If you've forgotten your password, use the 'Forgot Password' option on the login page, a reset link or OTP will be sent to your registered number immediately.",
          },
          {
            label: 'High Empathy',
            text: "We understand how frustrating it is to be locked out and we'll get you back in as fast as possible. Please share your registered phone number so we can verify the account and restore access.",
          },
          {
            label: 'Locked Account',
            text: "Your account may have been temporarily locked due to multiple failed login attempts, Please share your registered phone number and we'll check the status and assist you immediately.",
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
            text: "We're sorry to hear the password reset is not working. Please share your registered phone number, and confirm if you are receiving the OTP or if you encounter an error message on the page. We will check your account status and assist you with resetting access immediately.",
          },
          {
            label: 'Alt A',
            text: "If the password reset link or OTP isn't coming through or is failing, please send us your registered phone number and a description or screenshot of the error you see so we can verify your account and trigger a manual reset for you.",
          },
          {
            label: 'Troubleshooting / Clear Cache',
            text: "If you are having trouble resetting your password, please try clearing your browser cache or opening the page in incognito mode. If the issue persists, kindly share your registered phone number and we will assist directly.",
          },
          {
            label: 'High Empathy',
            text: "We understand how frustrating it is when a password reset fails and you are locked out of your account. Please share your registered phone number with us. Our team will verify your account and ensure your login access is restored right away.",
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
            text: "Happy to help. Please share your registered phone number so we can verify your account and get you sorted faster.",
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
            text: "Good news. Your account has been successfully reactivated. You can now log in and continue playing.",
          },
          {
            label: 'High Empathy',
            text: "Great news. Your account is active again! Go ahead and log in. We're right here if you need anything.",
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
            text: "We understand and we want to make this as easy as possible for you. To keep your account secure, we'll need to verify your identity before updating the number. Please share your current registered number, full name, and reason for the change.",
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
            text: "Following a review of your account activity, our team has identified a violation of our referral terms due to multiple accounts being created under the same identity to obtain the KSh 10 referral bonus, Based on checks including device verification, connection history, referral activity, and location data, withdrawals have been restricted. To restore withdrawal access, an account reset is required, which will clear all current funds. Please confirm if you agree to proceed.",
          },
          {
            label: 'High Empathy',
            text: "We understand this may be disappointing and we appreciate your patience. After reviewing your account, our system detected a referral policy violation involving multiple accounts under the same identity used to claim the KSh 10 bonus. Based on device, connection, referral, and location checks, withdrawals have been restricted. To restore access, an account reset is required and current funds will be cleared. Please confirm if you'd like to proceed.",
          },
          {
            label: 'Final Notice',
            text: "As previously advised, withdrawals remain restricted due to a confirmed referral policy violation, To restore access, an account reset is required. Please confirm your decision so we can proceed.",
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
            text: "We apologize for the inconvenience. The account reset feature is currently offline for system maintenance and updates. Our technical team is actively working on it and access will be restored once the update is completed. Please bear with us and feel free to check back later.",
          },
          {
            label: 'Alt A',
            text: "The account reset tool is temporarily unavailable due to ongoing technical maintenance. Our team is working to have the reset feature restored as soon as possible. Thank you for your patience while this is being worked on.",
          },
          {
            label: 'High Empathy',
            text: "We understand you want to reset your account and get your access sorted, and we apologize for the inconvenience. The account reset feature is currently undergoing technical maintenance and is temporarily offline. We appreciate your patience while our team works on restoring it.",
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
            text: "To delete your account, here are the steps, 1 Visit betfalme.ke/delete-account 2 Go to Profile 3 Click DELETE Account 4 Select your Period of Exclusion 5 Click Continue To Delete Account 6 Type DELETE to confirm with no spaces 7 Then confirm deletion. Important, Avoid depositing or requesting OTP for at least 48 hours after confirming. Any account activity in that window will undo the process.",
          },
          {
            label: 'High Empathy',
            text: "We're sorry to see you go and we respect your decision completely. To close your account, Visit betfalme.ke/delete-account, Go to Profile, Click DELETE Account, Select your exclusion period, Click Continue, Type DELETE to confirm, Then confirm. Please avoid any deposits or OTP requests for at least 48 hours after confirming, otherwise the process will reverse itself,",
          },
          {
            label: 'Self-Exclusion Focused',
            text: "We respect and fully support your decision. To self-exclude, Visit betfalme.ke/delete-account, Profile, DELETE Account, Choose your exclusion period (temporary or permanent), Continue, Type DELETE, Confirm. Please avoid all account activity for 48 hours after confirming. We're proud of you for taking this step.",
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
            text: "Your account deletion request has been received and logged into our technical queue. We process closures in the order they arrive. Please allow up to 72 hours for the team to fully finalize the block on all reactivation features including OTPs. To avoid delays, please refrain from any account activity during this window,",
          },
          {
            label: 'High Empathy A',
            text: "Your request is in and we've logged it. Our team processes closures first come, first served, and yours is in the queue. Please allow up to 48 to 72 hours for the process to fully complete. In the meantime, please avoid depositing or requesting an OTP as doing so will undo the closure request,",
          },
          {
            label: 'High Empathy B',
            text: "We've received your request and it's being processed. We know waiting feels frustrating when you've made this decision, and we genuinely appreciate your patience. Please hold off on any account activity, including OTP requests and deposits, until the team fully completes the closure. This ensures nothing interrupts the process,",
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
            text: "It appears some account activity occurred during the closure processing window, which has interrupted the process, To proceed with the closure, please re-initiate the request from your account and then avoid all activity including deposits and OTP requests for the full 48 to 72 hour processing period.",
          },
          {
            label: 'High Empathy',
            text: "We understand this may be frustrating and we're sorry for the confusion. Any account activity such as depositing or requesting an OTP during the closure window automatically reverses the process. This is how the system is built to work as a safeguard. To move forward, please re-initiate the closure request and avoid all account activity for the full 48 to 72 hour window. We're here to support you through this.",
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
            text: "Your account has been successfully closed. We're sorry to see you go and we wish you all the best. If you ever decide to return, you're always welcome at Betfalme.",
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
            text: "We hear you and your wellbeing matters to us more than anything else. Please remember that betting should always stay within your limits. If you feel overwhelmed, we strongly encourage you to take a break. You can activate self-exclusion right now, Visit betfalme.ke/delete-account, Go to Profile, DELETE Account, Choose your exclusion period, Confirm. We're here for you.",
          },
          {
            label: 'High Empathy',
            text: "We're really glad you reached out and we hear you. Please take a breath. Your wellbeing is more important than any bet. You can step away at any time, Visit betfalme.ke/delete-account, Profile, DELETE Account, Select exclusion period, Confirm. We're proud of you for taking this step.",
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
            text: "To activate self-exclusion, here are the steps, Visit betfalme.ke/delete-account, Go to Profile, Click DELETE Account, Choose your exclusion period, temporary or permanent, Click Continue, Type DELETE to confirm, Then confirm deletion. Important, Avoid depositing or requesting OTP for at least 48 hours after confirming, otherwise the process will be undone.",
          },
          {
            label: 'High Empathy',
            text: "We respect and fully support your decision. To self-exclude, Visit betfalme.ke/delete-account, Profile, DELETE Account, Choose your exclusion period, Continue, Type DELETE, Confirm. Please avoid any account activity for 48 hours after confirming. We're genuinely proud of you for taking this step.",
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
            text: "We appreciate you reaching out. Please be advised that we do not offer refunds on completed bets or deposits unless a verified system error has occurred, We have reviewed your account and found no system faults.",
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
            text: "We understand your frustration and we take all concerns seriously. Betfalme operates in full compliance with the Betting Control and Licensing Board (BCLB) regulations. You are welcome to escalate through the appropriate channels and we will fully cooperate, providing complete account logs for any formal review.",
          },
          {
            label: 'Compliance Detail',
            text: "Betfalme operates in full compliance with the Betting Control and Licensing Board (BCLB) regulations. All transactions and bet histories are independently audited. You are welcome to escalate through the appropriate channels and we will fully cooperate by providing complete account logs for any formal review.",
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
            text: "Following an internal review, irregular activity has been detected on this account, As a result, withdrawals have been temporarily restricted pending further investigation. We are unable to share full details of the investigation at this stage but will be in touch once the review is complete.",
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
            text: "Refund requests are subject to strict compliance review, Please provide all relevant documentation along with your registered phone number so our audit team can evaluate your case properly.",
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
            text: "The Sports Jackpot gives you a chance to win KES 100,000 by winning 5 qualifying bets in a row within the same day. Each bet must have total odds of 7.00 or higher, a minimum cash stake of KES 50, and every selection must be at 1.30 odds or higher. Bets below these thresholds are ignored and do not count. All 5 wins must land on the same calendar day as the streak resets at midnight EAT. A losing qualifying bet resets you to zero. Cashed-out and voided bets are neutral and neither advance nor reset your streak. Wins are checked by our team and credited to your wallet once confirmed.",
          },
          {
            label: 'Alt A',
            text: "The Sports Jackpot awards KES 100,000 to players who win 5 qualifying bets in a row on the same day. To qualify, each bet must have total odds of at least 7.00, a cash stake of at least KES 50, and all individual selections must be at 1.30 odds or higher. Your streak resets at midnight EAT, and any losing qualifying bet resets your streak to zero. Cashed-out or voided bets are neutral. Prizes are reviewed by our team and credited to your wallet.",
          },
          {
            label: 'High Empathy',
            text: "Great question about the Sports Jackpot. You have a shot at KES 100,000 by winning 5 qualifying bets consecutively within the same day. Each bet needs total odds of 7.00 or more, a minimum stake of KES 50, and every selection must be at least 1.30 odds. Bets below these thresholds simply do not count. All 5 wins must happen before midnight EAT when the streak resets. If a qualifying bet loses, the streak starts over. Cashed-out and voided bets do not affect your streak either way. Once you complete a winning streak, our team reviews and credits the prize to your wallet.",
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
            text: "For the Sports Jackpot, each qualifying bet must meet three criteria: total odds of 7.00 or higher, a minimum cash stake of KES 50, and every individual selection within the bet must be at odds of 1.30 or higher. Any bet that falls below these thresholds is simply ignored and does not count toward or against your streak.",
          },
          {
            label: 'Alt A',
            text: "To qualify for the Sports Jackpot, your bet must have total odds of at least 7.00, a cash stake of at least KES 50, and all selections must individually be at 1.30 odds or higher. Bets that do not meet these requirements are ignored and have no effect on your streak.",
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
            text: "Your Sports Jackpot streak must be completed within a single day as it resets at midnight EAT. Losing a qualifying bet takes your streak back to zero. Voided or cashed-out bets do not count for or against you. After winning, the jackpot is repeatable and your next qualifying bet starts a fresh streak.",
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
            text: "The Bazooka Jackpot rewards players who cash out at 2.50x or higher for 7 consecutive qualifying rounds. Each round requires a minimum bet of KES 20, and your cashout must be at 2.50x or higher to count. If a round has several slots, only one slot needs to reach 2.50x for it to count as a round win. Any round that does not qualify resets your streak. The jackpot is repeatable, so your streak starts again after each win. The prize pool stands at the current live amount shown in the game.",
          },
          {
            label: 'Alt A',
            text: "To win the Bazooka Jackpot, cash out at 2.50x or higher for 7 rounds in a row, with a minimum bet of KES 20 per round. In rounds with multiple slots, only one slot needs to reach 2.50x to qualify. Any round that does not qualify resets your streak back to zero. Once you win, the streak resets and starts again on your next round.",
          },
          {
            label: 'High Empathy',
            text: "The Bazooka Jackpot is an exciting ongoing prize pool. To win it, you need to cash out at 2.50x or higher for 7 consecutive rounds, staking at least KES 20 per round. For rounds with multiple slots, just one slot reaching 2.50x is enough for that round to count. Any missed round resets your streak. The good news is that it is fully repeatable, so every time you win, a new streak can begin right away.",
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
            text: "For the Bazooka Jackpot, a qualifying round requires a minimum bet of KES 20 and a cashout at 2.50x or higher. In rounds with several slots, only one slot needs to reach 2.50x for the round to count. Any round that does not qualify resets your streak entirely. The jackpot is repeatable and a new streak begins immediately after each win.",
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
            text: "The Early Payout feature lets you win before the match is over. With 1UP, your bet is paid out as a win the moment your selected team goes 1 goal ahead, even if the opposing team equalizes later. With 2UP, your bet is paid out the moment your team goes 2 goals ahead. This applies to Match Result singles on eligible football games. Odds are slightly lower in exchange for the early-win safety net, and once the lead is hit the win is locked regardless of what happens after.",
          },
          {
            label: 'Alt A',
            text: "Early Payout is a feature that settles your bet before the final whistle. If you select 1UP, your bet is marked as a win the instant your team takes a 1-goal lead. With 2UP it's settled when they go 2 goals ahead. It works on Match Result singles for eligible football matches. Please note that odds are slightly reduced compared to standard bets, but once the qualifying lead is achieved, the win is locked in permanently.",
          },
          {
            label: 'High Empathy',
            text: "Great question about Early Payout. This feature is designed to give you peace of mind during live matches. 1UP means your bet is cashed as a winner the moment your team goes 1 goal ahead, no matter what happens after. 2UP works the same way but triggers when your team leads by 2 goals. It is available on Match Result singles for eligible football games. The trade-off is slightly lower odds, but once your team hits that lead, your win is secured immediately.",
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
            text: "With 1UP, the moment your team takes a 1-goal lead in an eligible football match, your bet is instantly settled as a winner. The final result does not matter once the lead is reached. This is only available for Match Result singles and carries slightly reduced odds compared to a standard bet.",
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
            text: "2UP works just like 1UP but triggers when your team goes 2 goals ahead. The moment that 2-goal lead is reached in an eligible football match, your Match Result single is immediately settled as a win. Whatever happens after that point does not affect your payout. Odds are slightly lower than standard to account for the early-win advantage.",
          },
          {
            label: 'Alt A',
            text: "With 2UP, your bet is paid out as a win the instant your team leads by 2 goals in an eligible football game. Once that lead is secured, your winnings are locked in regardless of the final score. Like 1UP, this is available only on Match Result singles with slightly reduced odds.",
          },
        ],
      },
    ],
  },
];
