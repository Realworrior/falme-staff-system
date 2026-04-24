
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kgpcruwlejoougjbeouw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const categories = [
  {
    category: "👋 GREETINGS & CHAT FLOW",
    templates: [
      {
        title: "Client Says Hi After Auto Greeting",
        triggers: ["hi", "hello", "habari", "jambo", "mambo", "greeting", "hey"],
        goal: "De-escalate + Show understanding + Keep control",
        responses: [
          { type: "Standard", text: "Hello again 🙂 How can we assist you today?" },
          { type: "Alt 1", text: "Hello 🙂 You're now connected with support. Please let us know what issue you're facing." },
          { type: "Alt 2", text: "Hi 🙂 We're ready to assist. What seems to be the problem today?" },
          { type: "Alt 3", text: "Hello 🙂 Please go ahead and share your issue and we'll help you resolve it." },
          { type: "Alt 4", text: "Hi again 🙂 Tell us what you need help with and we'll take it from here." },
          { type: "High Empathy 1", text: "Hi there 🙂 Please tell us how we can help and we'll sort it out for you." },
          { type: "High Empathy 2", text: "Hello 🙂 Don't worry, we'll get this sorted. Tell us what happened." },
          { type: "High Empathy 3", text: "Hi 🙂 We understand things can go wrong. Let's fix this together." },
          { type: "High Empathy 4", text: "Hello 🙂 We're here with you. Just explain the issue and we'll assist immediately." }
        ]
      },
      {
        title: "Client Is Vague — 'Help' / 'Problem'",
        triggers: ["help", "problem", "nisaidie", "msaada", "vague", "issue"],
        goal: "Request key info (number, amount, time)",
        responses: [
          { type: "Standard", text: "Hello! Please let us know the issue you're experiencing and include any relevant details such as your account number or transaction reference, if applicable." },
          { type: "Alt 1", text: "Hello 🙂 Kindly share your phone number, amount, and time so we can assist quickly." },
          { type: "Alt 2", text: "Hi 🙂 Please provide full details so we can locate your account and help without delay." },
          { type: "Alt 3", text: "Hello 🙂 Let us know what happened and include key details so we can resolve this faster." },
          { type: "Alt 4", text: "Hi 🙂 Please explain the issue and include your number or transaction info." }
        ]
      },
      {
        title: "Client Immediately Urgent — 'Where Is My Money'",
        triggers: ["where is my money", "pesa yangu iko wapi", "withdrawal", "money", "funds", "withdraw", "hurry", "urgent"],
        goal: "Reassure + Show action already taken + Request key info",
        responses: [
          { type: "Response 1", text: "We understand this is urgent 🙏 Your request has already been received and is currently being processed. Please share your phone number, amount, and time so we can check immediately." },
          { type: "Response 2", text: "We understand the urgency 🙏 Your transaction is already in progress. Kindly send your number, amount, and time so we can prioritize this." },
          { type: "Response 3", text: "We've received your request and it's under processing 🔄 Please share your details so we can update you right away." },
          { type: "Response 4", text: "Your request is already being handled. Kindly provide your phone number, amount, and exact time so we can assist faster." }
        ]
      },
      {
        title: "Insults / Aggression",
        triggers: ["stupid", "useless", "fraud", "scam", "thieves", "steal", "mbwa", "ujinga", "angry", "abuse"],
        goal: "Set boundary + Remain calm",
        responses: [
          { type: "Standard", text: "We understand you may be frustrated. Please note that respectful communication helps us assist you better. Kindly explain the issue you are experiencing and we will do our best to help." },
          { type: "Alt 1", text: "We understand you're upset. Kindly keep the conversation respectful so we can assist you effectively." },
          { type: "Alt 2", text: "We're here to help. Please explain your issue clearly so we can resolve it." },
          { type: "Alt 3", text: "We understand frustration happens. Let's focus on fixing the issue together." },
          { type: "Alt 4", text: "We're ready to assist. Please communicate respectfully so we can help faster." },
          { type: "High Empathy 1", text: "We understand you may be upset and we truly want to help resolve your issue. We kindly ask that the conversation remains respectful so we can assist you effectively. Please let us know the problem you are facing." },
          { type: "High Empathy 2", text: "We hear you 🙏 Let's work through this together. Please share your issue." },
          { type: "High Empathy 3", text: "We understand this is frustrating 🙏 We're here to help. Just tell us what happened." },
          { type: "High Empathy 4", text: "We want to resolve this for you 🙏 Kindly share your issue and we'll assist." },
          { type: "Firm Boundary", text: "We're ready to assist. However, respectful communication is required for us to continue 🙏" }
        ]
      },
      {
        title: "Closing Statement",
        triggers: ["thanks", "asante", "bye", "resolved", "okay", "done", "goodbye"],
        goal: "Retention + Finality",
        responses: [
          { type: "Standard", text: "Thank you for choosing Betfalme. We're glad your issue has been resolved. If you need any further assistance, feel free to reach out anytime. You're always welcome 🙂" },
          { type: "Alt 1", text: "Thank you for choosing Betfalme 🙂 Your issue has been resolved. Feel free to reach out anytime." },
          { type: "Alt 2", text: "All set 🙂 We're glad this is sorted. Let us know if you need anything else." },
          { type: "Alt 3", text: "Your account is now in order 🙂 You can continue normally. We're here if needed." },
          { type: "Alt 4", text: "Thanks for reaching out 🙂 Everything is resolved. Feel free to contact us anytime." },
          { type: "High Empathy 1", text: "Thank you for your patience and for choosing Betfalme 🙏 We're happy the issue has been resolved. If you need anything else, please don't hesitate to contact us. You're always welcome back 🙂" },
          { type: "High Empathy 2", text: "We appreciate your patience 🙏 Glad we could resolve this. We're always here for you." },
          { type: "High Empathy 3", text: "Thank you for working with us 🙏 Everything is now sorted. Reach out anytime." },
          { type: "High Empathy 4", text: "Thanks for your patience 🙏 We're here anytime you need support. Take care! 🙂" }
        ]
      }
    ]
  },
  {
    category: "⏳ CLIENT PATIENCE / UNDER REVIEW",
    templates: [
      {
        title: "Case Submitted to Technical Team",
        triggers: ["review", "check", "technical", "wait", "pending", "status", "feedback"],
        responses: [
          { type: "Standard", text: "Your issue has been submitted to our Technical Team for review. We will update you once we receive feedback. Thank you for your patience." },
          { type: "Alt 1", text: "Your request has been received and is now under technical review 🔄 We'll update you once completed." },
          { type: "Alt 2", text: "Your issue has been escalated and is currently being processed. We'll update you soon." },
          { type: "Alt 3", text: "Your request is already in progress with our Technical Team. We'll notify you once done." },
          { type: "Alt 4", text: "We've forwarded your case for review. Feedback will be shared once available." },
          { type: "High Empathy 1", text: "We understand waiting can be stressful. Your issue is under review and we will update you as soon as possible. Thank you for your patience 🙏" },
          { type: "High Empathy 2", text: "We understand the wait 🙏 Your case is being actively handled. We'll update you shortly." },
          { type: "High Empathy 3", text: "We know this is important 🙏 Your issue is already under review." },
          { type: "High Empathy 4", text: "We appreciate your patience 🙏 The team is working on your request." }
        ]
      },
      {
        title: "Ticket Still in Queue",
        triggers: ["queue", "waiting", "not attended", "attended", "still waiting"],
        responses: [
          { type: "Standard", text: "Your ticket is still in the queue and has not yet been attended to. We appreciate your patience." },
          { type: "High Empathy", text: "Your ticket is still waiting to be reviewed. We truly appreciate your patience 🙏 We'll notify you as soon as there's an update." },
          { type: "Alt", text: "We haven't forgotten you 🙏 Your case is queued and will be handled as soon as possible. Thank you for bearing with us." }
        ]
      },
      {
        title: "Roll Back — Funds Returned",
        triggers: ["refund", "returned", "rollback", "funds back", "credited back", "balance updated"],
        responses: [
          { type: "Standard", text: "The amount has now been rolled back to your account. Please refresh your account and confirm that your balance has updated." },
          { type: "Alt 1", text: "The funds have been returned 🙂 Please refresh and confirm your balance." },
          { type: "Alt 2", text: "Your account has been updated. Kindly check your balance." },
          { type: "Alt 3", text: "The amount has been credited back. Refresh and confirm." },
          { type: "High Empathy 1", text: "Good news 🙂 The amount has been successfully rolled back to your account. Kindly refresh your account and confirm that your balance has updated. Let us know if everything reflects correctly." },
          { type: "High Empathy 2", text: "Great news 🙂 Your funds are back. Please refresh and confirm. Let us know if anything looks off!" },
          { type: "High Empathy 3", text: "All sorted 🙂 Please refresh and confirm everything reflects correctly." }
        ]
      },
      {
        title: "No Lost Amount — All Transactions Correct",
        triggers: ["no loss", "missing", "correct", "review", "activity"],
        responses: [
          { type: "Standard", text: "After reviewing your account, our Technical Team has confirmed that all transactions were processed correctly and no funds were lost. Please take a moment to check your account activity." },
          { type: "High Empathy", text: "We understand your concern and appreciate your patience 🙏 After carefully reviewing your account, our Technical Team has confirmed that all transactions were processed correctly and no funds were lost. Please check your account activity. If you still notice anything unusual, let us know so we can assist further." },
          { type: "Alt", text: "We've completed a full review 🔍 All transactions on your account show as correct and no funds are missing. If you still have concerns, kindly share the specific time and amount so we can double-check." }
        ]
      }
    ]
  },
  {
    category: "⚽ SPORTS BETTING",
    templates: [
      {
        title: "Pending Betslip — Postponed Game",
        triggers: ["postponed", "cancelled match", "not played", "match time", "settled", "betslip"],
        responses: [
          { type: "Standard", text: "Postponed games are settled within 24 hours after the scheduled match time. Your betslip will update automatically." },
          { type: "High Empathy", text: "We understand the wait can be frustrating 🙏 Postponed games are processed within 24 hours after the scheduled match time. Your betslip will update on its own. No action needed." },
          { type: "Alt", text: "No need to worry 🙂 Postponed match betslips settle automatically within 24 hours of the original match time." }
        ]
      },
      {
        title: "Unpaid Winning Bet",
        triggers: ["winning bet", "not paid", "unpaid", "won", "won bet", "bet id"],
        responses: [
          { type: "Standard", text: "Please share a screenshot of the betslip, the Bet ID (for example #678534), and your registered phone number so we can assist." },
          { type: "High Empathy", text: "We understand your concern 🙏 Kindly send the betslip screenshot, Bet ID, and your registered phone number so we can check quickly." },
          { type: "Alt", text: "We'll look into this right away 🔍 Please send your Bet ID (e.g. #678534), betslip screenshot, and registered number." }
        ]
      },
      {
        title: "Voided Bet — Placed After Match Started",
        triggers: ["void", "voided", "match started", "already started", "irregular", "policy"],
        responses: [
          { type: "Official Decision", text: "Dear Client, following a detailed investigation by our Technical and Risk Management teams, the review of the flagged bet slip has been completed. Our analysis confirmed the bet was placed after the respective match had already started. According to our betting rules and T&Cs, all wagers must be placed before the official start time unless the market is specifically offered as in-play. Since the event had already commenced when the bet was accepted, the bet slip has been identified as irregular. As a result, the wager has been voided in accordance with our platform's policies. This decision is final." },
          { type: "Shorter Version", text: "After review, the bet was confirmed to have been placed after the match had already started. As per our betting rules, all bets must be placed before kick-off unless it is a live market. The bet has been voided and the decision is final." },
          { type: "Empathy Add-On", text: "We understand this may be disappointing 🙏 However, the review confirms the bet was placed after the match started, which is outside our T&Cs. The void decision stands as per platform policy." }
        ]
      },
      {
        title: "Cash Out Not Processed",
        triggers: ["cash out", "cashout failed", "not processed", "attempted", "fluctuations"],
        responses: [
          { type: "Standard", text: "Please share the Bet ID, the exact time you attempted the cash out, and your registered phone number so we can investigate." },
          { type: "High Empathy", text: "We understand this is frustrating 🙏 Cash out requests are time-sensitive. Kindly send the Bet ID, exact time, and your phone number so we can review what happened." },
          { type: "System Note", text: "Please note that cash out may be unavailable during live odds fluctuations or high traffic. If your cash out failed, share your Bet ID and time so we can check." }
        ]
      },
      {
        title: "Wrong Odds Applied to Bet",
        triggers: ["wrong odds", "different odds", "changed odds", "odds", "recorded"],
        responses: [
          { type: "Standard", text: "Odds are confirmed at the time a bet is placed and are subject to change until submission. Please share your Bet ID so we can review the odds recorded at submission time." },
          { type: "High Empathy", text: "We understand this can be confusing 🙏 Odds are locked in at the exact moment your bet is submitted. Kindly share your Bet ID and we'll confirm what was recorded." }
        ]
      },
      {
        title: "Bet Not Accepted / Rejected",
        triggers: ["rejected", "not accepted", "error message", "declined", "limit"],
        responses: [
          { type: "Standard", text: "Please share a screenshot of the error message and your registered phone number so we can check why the bet was not accepted." },
          { type: "High Empathy", text: "We're sorry that happened 🙏 Bets can be declined due to odds changes, stake limits, or market closure. Kindly share the error screenshot and your number so we can assist." },
          { type: "Common Reasons", text: "Bets may be declined because the market closed before submission · odds shifted during loading · or the stake exceeds the allowed limit for that market. If the issue persists, share a screenshot and we'll investigate." }
        ]
      }
    ]
  },
  {
    category: "🎰 CASINO GAMES",
    templates: [
      {
        title: "Lost Amount Report — Aviator, Jet X, Crash Games",
        triggers: ["lost amount", "lost money", "aviator lost", "crash lost", "round", "separately"],
        responses: [
          { type: "Standard", text: "Please provide your phone number, game played, the exact amount lost, and the exact time of each round. Do not combine amounts. Each round must be shared separately." },
          { type: "High Empathy", text: "We understand how concerning this is 🙏 Kindly share your phone number, the exact amount lost, and the exact time for each round separately. Please do not sum the amounts so we can check accurately." },
          { type: "Alt", text: "To trace your rounds accurately 🔍 please send: phone number ✦ game name ✦ exact amount per round ✦ exact time per round. Please list each round one by one." }
        ]
      },
      {
        title: "Pending Cashout — Crash / Aviator",
        triggers: ["pending cashout", "aviator cashout", "crash cashout", "screenshot", "worrying"],
        responses: [
          { type: "Standard", text: "Please share a screenshot of the specific game showing the bet, the exact time of the round, and your registered phone number." },
          { type: "High Empathy", text: "We understand this can be worrying 🙏 Kindly send the game screenshot, include the exact time of the round and your phone number so we can assist quickly." },
          { type: "Alt", text: "To check your pending cashout, please send a screenshot of the round, your registered number, and the exact time the round occurred." }
        ]
      },
      {
        title: "Game Result Dispute — Outcome Incorrect",
        triggers: ["dispute", "outcome", "incorrect result", "incorrect outcome", "round id"],
        responses: [
          { type: "Standard", text: "All game outcomes are generated and recorded by the game server. Please share the round ID or a screenshot showing the issue, your phone number, and the exact time so we can escalate to the provider." },
          { type: "High Empathy", text: "We take game disputes seriously 🙏 Please send the round ID, a screenshot if available, your phone number, and exact time so we can escalate to our technical team for a full review." }
        ]
      }
    ]
  },
  {
    category: "👤 ACCOUNT MANAGEMENT",
    templates: [
      {
        title: "Account Closure / Self-Exclusion",
        triggers: ["delete account", "close account", "self exclusion", "exclusion", "delete", "futa account"],
        responses: [
          { type: "Standard", text: "To delete your account, please visit betfalme.ke/delete-account ✦ Once there: go to Profile ✦ click DELETE Account ✦ select Period of Exclusion ✦ click Continue To Delete Account ✦ type DELETE to confirm (no spaces) ✦ then confirm deletion." },
          { type: "High Empathy", text: "We're sorry to see you go 🙏 To delete your account, please visit betfalme.ke/delete-account ✦ Follow the steps: Profile ✦ DELETE Account ✦ select your exclusion period ✦ Continue ✦ type DELETE to confirm ✦ then confirm. If you need any help during the process, we're right here." },
          { type: "Alt Short", text: "Please visit betfalme.ke/delete-account ✦ go to Profile ✦ DELETE Account ✦ choose exclusion period ✦ type DELETE to confirm. We're here if you get stuck 🙂" }
        ]
      },
      {
        title: "Account Reactivation",
        triggers: ["reactivate", "enable account", "activate account", "washa account"],
        responses: [
          { type: "Standard", text: "Good news 🙂 Your account has been successfully reactivated. You can now log in and continue playing." },
          { type: "High Empathy", text: "Great news 🙂 Your account is now active again! You can log in and continue playing. If you need any assistance, we're here to help." }
        ]
      },
      {
        title: "Account Verification Request",
        triggers: ["verify", "verification", "registered phone", "confirm name"],
        responses: [
          { type: "Standard", text: "Kindly share your registered phone number so we can verify your account and assist you." },
          { type: "High Empathy", text: "We're happy to help 🙂 Please share your registered phone number so we can verify your account and assist faster." },
          { type: "Alt", text: "To verify your account, kindly share your registered phone number and confirm the name used at registration. This helps us locate and assist you quickly." }
        ]
      },
      {
        title: "Referral Violation — Multiple Accounts Detected",
        triggers: ["multiple accounts", "referral violation", "bonus abuse", "restriction", "reset", "identity"],
        responses: [
          { type: "Standard", text: "Following a review of your account activity, we have found that our referral terms were violated due to the creation of multiple accounts under the same identity to obtain the KSh 10 referral bonus. Based on internal checks including device verification, connection history, referral activity, and location data, withdrawals have been restricted. To restore withdrawal access, the account will need to be reset, which will clear all current funds. Kindly confirm if you agree to proceed with the account reset." },
          { type: "High Empathy", text: "We understand this may be disappointing 🙏 After reviewing your account activity, our system detected a violation of the referral terms due to multiple accounts being created under the same identity to claim the KSh 10 bonus. Based on checks including device verification, connection history, referral behaviour, and location data, withdrawals have been restricted. To restore access, the account will need to be reset, which clears the current funds. Please confirm if you would like us to proceed with the reset." },
          { type: "Final Notice", text: "As previously advised, withdrawals remain restricted due to a confirmed referral policy violation. To restore access, an account reset is required. Please confirm your decision so we can proceed accordingly." }
        ]
      },
      {
        title: "Account Reset Confirmation",
        triggers: ["reset complete", "account reset", "successful reset", "restored"],
        responses: [
          { type: "Standard", text: "Your account has been successfully reset. You can now log in and continue using your account. Please ensure all future activity follows our referral and platform policies." },
          { type: "High Empathy", text: "Your account has now been successfully reset 🙂 You can log in and continue using your account. Please ensure future activity follows our referral and platform rules to avoid any further restrictions. If you need help, we're here to assist." }
        ]
      },
      {
        title: "Suspicious Reset Request — Technical Limitation",
        triggers: ["reset unavailable", "technical limitation", "cannot reset", "new account", "limitation"],
        responses: [
          { type: "Standard", text: "We are currently experiencing a technical limitation affecting the account reset option. As an alternative, you may create a new account. Please ensure all future activity follows our platform policies and referral rules." },
          { type: "High Empathy", text: "We understand the inconvenience this may cause 🙏 At the moment, the account reset option is temporarily unavailable due to a technical limitation. You may create a new account instead, and we kindly ask that all future activity follows our platform and referral policies." }
        ]
      },
      {
        title: "Login Issues — Can't Access Account",
        triggers: ["cannot login", "access account", "forgot password", "otp", "locked account"],
        responses: [
          { type: "Standard", text: "Please confirm your registered phone number so we can check the account status and assist with access." },
          { type: "Alt Reset", text: "If you've forgotten your password, use the 'Forgot Password' option on the login page. A reset link or OTP will be sent to your registered number." },
          { type: "High Empathy", text: "We understand how frustrating it is to be locked out 🙏 Please share your registered phone number so we can verify the account and help restore access quickly." },
          { type: "Locked Account", text: "Your account may have been temporarily locked due to multiple failed login attempts. Kindly share your registered number and we'll check the status immediately." }
        ]
      },
      {
        title: "Phone Number Change Request",
        triggers: ["change number", "update number", "phone change", "verification"],
        responses: [
          { type: "Standard", text: "For security purposes, phone number changes require identity verification. Please share your registered number, full name on the account, and a reason for the change so we can assist." },
          { type: "High Empathy", text: "We understand 🙂 To keep your account secure, we'll need to verify your identity before updating the number. Please share your current registered number, full name, and reason for the change." }
        ]
      }
    ]
  },
  {
    category: "🎁 PROMOTIONS & REFERRALS",
    templates: [
      {
        title: "Available Offers — Full List",
        triggers: ["offers", "promotions", "bonus list", "cashback list", "daily cashback", "unlimited rains"],
        responses: [
          { type: "Standard", text: "At Betfalme, we currently offer: Tax-free bets ✦ 10% daily cashback on losses ✦ Unlimited rains on Aviator ✦ KSh 10 referral bonus ✦ 5% referral income ✦ 20% cashback on sports bets ✦ Free bet when you refer an eligible user." },
          { type: "High Empathy", text: "Thank you for your interest in our offers 🙂 Betfalme currently provides: Tax-free bets ✦ 10% daily cashback on losses ✦ Unlimited rains on Aviator ✦ KSh 10 referral bonus ✦ 5% referral income ✦ 20% cashback on sports bets ✦ A free bet when you refer an eligible user. Keep an eye on the platform for new promotions!" }
        ]
      },
      {
        title: "Deposit Bonus Expired",
        triggers: ["bonus expired", "ended", "fully claimed", "limited time"],
        responses: [
          { type: "Standard", text: "The deposit bonus was a limited-time offer and has already ended after being fully claimed. Please watch out for upcoming promotions." },
          { type: "High Empathy", text: "We understand this may be disappointing 🙏 The bonus was time-based and has already been fully claimed. Please stay tuned for the next offer. More great promotions are coming 🙂" }
        ]
      },
      {
        title: "Referral Bonus Not Received",
        triggers: ["referral bonus", "not received", "unique link", "verification", "policy"],
        responses: [
          { type: "Standard", text: "Please confirm your referral used your unique link and completed account verification. Once verified, the bonus is credited automatically as per our policy." },
          { type: "High Empathy", text: "We understand this can be frustrating 🙏 Kindly confirm your referral used your link and completed verification. The bonus is credited automatically once all conditions are met." },
          { type: "Alt", text: "To check your referral bonus, please share your registered number and the number of the person you referred. We'll verify if all conditions were met." }
        ]
      },
      {
        title: "Rain Promotion — Aviator",
        triggers: ["rain", "aviator rain", "random credits", "game chat", "active players"],
        responses: [
          { type: "Standard", text: "Aviator Rains are random promotional credits dropped in the Aviator game chat. They are available to active players in the game at the time of the drop. There is no way to manually request a Rain. Just stay active in the game." },
          { type: "High Empathy", text: "Rains are exciting 🙂 They're randomly dropped in Aviator game chat for active players. Stay in the game and keep playing. The next rain could be yours!" }
        ]
      },
      {
        title: "Sports Cashback — 20%",
        triggers: ["sports cashback", "20%", "lost sports bets", "automatic"],
        responses: [
          { type: "Standard", text: "The 20% sports cashback applies to qualifying lost sports bets. Cashback is processed automatically and credited to eligible accounts. Please check your account activity to confirm if it has been applied." },
          { type: "High Empathy", text: "We want to make sure you benefit from every offer 🙂 The 20% sports cashback is automatically credited on qualifying losses. Please check your account. If it hasn't reflected, share your number and we'll look into it." }
        ]
      }
    ]
  },
  {
    category: "💸 WITHDRAWALS & TRANSACTIONS",
    templates: [
      {
        title: "First Withdrawal — Referral Bonus Rule (KSh 250)",
        triggers: ["withdraw limit", "250", "bonus withdraw", "first withdrawal", "threshold"],
        responses: [
          { type: "Standard", text: "Your account balance is currently below the bonus withdrawable limit of KSh 250. To withdraw any bonus funds, please ensure your total balance is at least KSh 250 as per our withdrawal policy." },
          { type: "Clarifying", text: "The KSh 250 minimum withdrawal applies only to first-time withdrawals made using referral bonus without a deposit. After your first withdrawal, the minimum withdrawal amount becomes KSh 50." },
          { type: "High Empathy", text: "We understand you'd like to withdraw 🙂 Please note KSh 250 only applies to your first withdrawal using referral bonus without deposit. After that, the minimum becomes KSh 50." },
          { type: "Impatient Client", text: "You're almost there 🙂 Just top up or play until your balance reaches KSh 250. Then withdrawal will be available immediately." },
          { type: "Angry Client", text: "We understand this may feel restrictive 🙏 However this is part of our bonus withdrawal policy. Once the KSh 250 threshold is reached, your withdrawal will go through normally." }
        ]
      },
      {
        title: "Balance Below KSh 50",
        triggers: ["below 50", "limit 50", "minimum withdrawal", "balance 50"],
        responses: [
          { type: "Standard", text: "Your balance is below the minimum withdrawal limit of KSh 50. Please ensure your balance reaches KSh 50 to proceed." },
          { type: "High Empathy", text: "We understand the urgency 🙏 Withdrawals require a minimum balance of KSh 50. Once your balance reaches this amount, you can withdraw." },
          { type: "Alt Fast", text: "Minimum withdrawal is KSh 50. Top up or continue playing to reach the limit. Then you're good to go 🙂" }
        ]
      },
      {
        title: "Pending Withdrawal — Requesting Details",
        triggers: ["pending withdrawal", "trace", "escalate", "requesting details"],
        responses: [
          { type: "Standard", text: "Please share your registered phone number, the pending amount, and the exact time you made the withdrawal request so we can review." },
          { type: "High Empathy", text: "We understand the concern 🙏 Kindly send your phone number, the pending amount, and the exact time of the request so we can assist quickly." },
          { type: "Alt Urgent", text: "We'll check this right away 🔍 Please send: phone number ✦ withdrawal amount ✦ exact time of request." }
        ]
      },
      {
        title: "Client Eligible to Withdraw",
        triggers: ["eligible", "can withdraw", "proceed"],
        responses: [
          { type: "Standard", text: "Good news 🙂 Your account is now eligible for withdrawal. You may proceed." },
          { type: "High Empathy", text: "Great news 🙂 You can now withdraw from your account. Please proceed at your convenience." },
          { type: "Alt Retention", text: "Good news 🙂 You're all set to withdraw, or keep playing if you prefer. Your call! 😊" }
        ]
      },
      {
        title: "Withdrawal Delayed — Processing Time",
        triggers: ["delayed", "processing", "30 minutes", "waiting", "delay"],
        responses: [
          { type: "Standard", text: "Withdrawals are typically processed within a few minutes. If yours has been pending for more than 30 minutes, please share your phone number, amount, and exact time so we can escalate." },
          { type: "High Empathy", text: "We understand delays are frustrating 🙏 Most withdrawals process within minutes. If yours has been pending over 30 minutes, kindly send your number, amount, and time. We'll prioritize the check." }
        ]
      },
      {
        title: "Withdrawal Failed — Funds Not Received",
        triggers: ["failed withdrawal", "not received", "trace", "active mpesa"],
        responses: [
          { type: "Standard", text: "Please confirm your M-PESA number is registered and active, then share the withdrawal time, amount, and your phone number so we can trace the transaction." },
          { type: "High Empathy", text: "We're sorry to hear that 🙏 Please confirm your M-PESA number is active and share: phone number ✦ amount ✦ exact time of withdrawal. We'll trace this immediately." }
        ]
      }
    ]
  },
  {
    category: "💳 DEPOSITS — M-PESA",
    templates: [
      {
        title: "Failed Deposit — M-PESA Code Required",
        triggers: ["failed deposit", "mpesa code", "transaction message", "10-character", "UA58134GTJ", "code"],
        responses: [
          { type: "Standard", text: "If your deposit was unsuccessful, please share the full M-PESA transaction message as text or send the 10-character transaction code from the SMS. Example: UA58134GTJ · Mini-statement codes are not accepted. Please do not send a screenshot — share the message as text." },
          { type: "High Empathy", text: "We understand this can be frustrating 🙏 Kindly send the full M-PESA confirmation message as text or the 10-character transaction code from the SMS so we can assist quickly. Mini-statements are not accepted and screenshots are not required." },
          { type: "Alt Fast", text: "Share M-PESA code (e.g. UA58134GTJ) or full SMS text. Screenshots not needed. Mini-statement codes not accepted." }
        ]
      },
      {
        title: "Client Self-Check — Deposit Unsuccessful Option",
        triggers: ["self check", "deposit unsuccessful", "footer", "verify code"],
        responses: [
          { type: "Standard", text: "You can also verify your code by going to your account ✦ scroll to the footer ✦ click \"Deposit Unsuccessful?\" ✦ then find the 10-character transaction code at the start of your M-PESA SMS. Example: SJ82KFNAX4" },
          { type: "High Empathy", text: "To make it easier 🙂 go to your account ✦ scroll to the footer ✦ click \"Deposit Unsuccessful?\" ✦ enter the 10-character code from your M-PESA SMS. Example: SJ82KFNAX4" }
        ]
      },
      {
        title: "Deleted M-PESA Message",
        triggers: ["deleted mpesa", "deleted message", "retrieve code", "full statement"],
        responses: [
          { type: "Standard", text: "Please retrieve the transaction code from the M-PESA app or contact Safaricom Customer Care and request a full M-PESA statement. Mini-statements are not accepted." },
          { type: "Alt", text: "If the SMS was deleted, open your M-PESA app and check transaction history for the 10-character code. Or contact Safaricom to request a full statement. Mini-statements cannot be used." }
        ]
      },
      {
        title: "Airtel or Bank Deposit — Not Supported",
        triggers: ["airtel", "bank deposit", "not supported", "reversal"],
        responses: [
          { type: "Standard", text: "Betfalme currently supports M-PESA only. Please contact your service provider to request a reversal, then deposit using M-PESA." },
          { type: "High Empathy", text: "We understand the inconvenience 🙏 At the moment we only support M-PESA deposits. Kindly request a reversal from your provider and deposit again using M-PESA." },
          { type: "Alt Solution", text: "After the reversal is processed, you can deposit via M-PESA. Or share a Safaricom number for transfer if needed. We'll assist once confirmed." }
        ]
      },
      {
        title: "M-PESA Network Delay Notice",
        triggers: ["network delay", "safaricom issue", "temporary delay", "safe"],
        responses: [
          { type: "Standard", text: "Dear Customer, we are aware of delays affecting some M-PESA deposits and withdrawals due to a temporary Safaricom network issue. This is not a Betfalme system problem. Your funds are safe and will reflect automatically once the network is fully restored. Thank you for your patience." },
          { type: "High Empathy", text: "We understand delays can be frustrating 🙏 The issue is from the Safaricom network and not Betfalme. Your funds are safe and will reflect automatically once service is restored. We appreciate your patience and are monitoring the situation closely." },
          { type: "Short Notice", text: "There is a temporary Safaricom network delay affecting deposits and withdrawals. Your funds are safe 🔒 They will reflect automatically once the network is restored. Thank you for your patience." }
        ]
      }
    ]
  },
  {
    category: "🔄 CASHBACK — 10%",
    templates: [
      {
        title: "Where Is My Cashback",
        triggers: ["where is cashback", "cashback not received", "8:35 PM", "calculate"],
        responses: [
          { type: "Standard", text: "Cashback is automatically calculated and credited for eligible customers who record a net loss during the cashback period. Cashback is processed daily at 8:35 PM. If it has not reflected yet, please wait until after 8:35 PM." },
          { type: "High Empathy", text: "We understand the concern 🙏 Cashback is processed daily at 8:35 PM. If eligible, it will reflect automatically after that time." },
          { type: "Alt Angry", text: "Cashback is not instant. It is calculated and credited once daily at 8:35 PM. If you're eligible, it will appear automatically. No manual request is needed." }
        ]
      },
      {
        title: "Cashback Not Received — Conditions Not Met",
        triggers: ["no cashback", "not met", "net loss", "withdrawals deposits"],
        responses: [
          { type: "Standard", text: "Cashback is credited only if you made deposits and your total withdrawals are less than your total deposits during the cashback period, resulting in a net loss. If withdrawals are equal to or higher than deposits, no cashback is generated." },
          { type: "High Empathy", text: "Cashback is given only when deposits are higher than withdrawals within the cashback period 🙂 If there is no net loss, cashback will not be generated. This is calculated automatically by the system." },
          { type: "Alt Firm", text: "System calculates automatically. If deposits do not exceed withdrawals, no cashback is issued. No net loss = no cashback." }
        ]
      },
      {
        title: "How to Calculate Cashback",
        triggers: ["how to calculate", "formula", "subtract", "example"],
        responses: [
          { type: "Standard", text: "Cashback is 10% of the difference between total deposits and total withdrawals made from yesterday 8:35 PM to today 8:35 PM. For example: Deposit KSh 1,000 ✦ Withdraw KSh 600 ✦ Loss = KSh 400 ✦ Cashback = KSh 40." },
          { type: "High Empathy", text: "To calculate 🙂 subtract withdrawals from deposits between 8:35 PM yesterday and 8:35 PM today. If there is a loss, 10% of that amount is credited at 8:35 PM." },
          { type: "Simple Formula", text: "Formula: Deposits minus Withdrawals = Net loss. 10% of net loss = Cashback. Example: 1000 minus 600 = 400. 400 × 10% = KSh 40 cashback 🙂" }
        ]
      },
      {
        title: "Will I Get Cashback Today",
        triggers: ["get cashback today", "guaranteed", "conditions"],
        responses: [
          { type: "Standard", text: "You will receive cashback today at 8:35 PM if: deposits were made between yesterday 9:00 PM and today 8:35 PM ✦ withdrawals are less than deposits ✦ your account shows a net loss." },
          { type: "High Empathy", text: "If you meet the conditions and recorded a net loss 🙂 cashback will reflect automatically at 8:35 PM. No action needed!" },
          { type: "Alt Fast", text: "Check at 8:35 PM. If deposits are greater than withdrawals, cashback is guaranteed. If not, none will be issued." }
        ]
      }
    ]
  },
  {
    category: "🎗️ RESPONSIBLE GAMING",
    templates: [
      {
        title: "General Notice",
        triggers: ["responsible gaming", "limits", "break", "well-being"],
        responses: [
          { type: "Standard", text: "Betting should always be done responsibly and within your financial limits. If you need a break, you may request self-exclusion or account closure at any time." },
          { type: "High Empathy", text: "Your well-being matters to us 🙏 If betting feels stressful, please consider taking a break or activating self-exclusion. We are here to support you." }
        ]
      },
      {
        title: "Loss Distress — Client Overwhelmed",
        triggers: ["lost everything", "overwhelmed", "distress", "take a break"],
        responses: [
          { type: "Response 1", text: "We understand losses can be difficult 🙏 Please remember betting should remain within your limits. Taking a break can help you regain perspective." },
          { type: "Response 2", text: "If you feel overwhelmed 🙏 we recommend pausing and reviewing your activity. We can assist with deposit limits or self-exclusion if you'd like." },
          { type: "Response 3", text: "We encourage responsible gaming 🙏 If betting is causing stress, please consider self-exclusion or contacting support for assistance. Your well-being comes first." }
        ]
      },
      {
        title: "Chasing Losses — High Risk",
        triggers: ["recover losses", "chasing", "high risk", "safety"],
        responses: [
          { type: "Response 1", text: "We strongly advise against trying to recover losses through further betting 🙏 Please take a break and only continue when you feel comfortable and in control." },
          { type: "Response 2", text: "It's important to pause and reassess 🙏 Continuing to play to recover losses can increase risk. We can assist with setting limits if needed." },
          { type: "Response 3", text: "For your safety, we do not encourage continued play to recover losses 🙏 Support options including self-exclusion are available. Just ask." }
        ]
      },
      {
        title: "Self-Exclusion Request",
        triggers: ["activate self exclusion", "exclusion steps", "proud"],
        responses: [
          { type: "Standard", text: "To activate self-exclusion, please visit betfalme.ke/delete-account and follow the steps to select your exclusion period. You can choose a temporary or permanent exclusion." },
          { type: "High Empathy", text: "We respect and support your decision 🙏 To self-exclude, visit betfalme.ke/delete-account ✦ go to Profile ✦ DELETE Account ✦ choose your exclusion period ✦ confirm. We're proud of you for taking this step." }
        ]
      }
    ]
  },
  {
    category: "🔥 HARD CASES",
    templates: [
      {
        title: "Refund Refusal — No Valid Claim",
        triggers: ["no refund", "applicable", "system data", "no fault"],
        responses: [
          { type: "Response 1", text: "We understand your request. However, after full system review, all transactions were processed correctly. No discrepancies were found. Therefore no refund is applicable under our terms." },
          { type: "Response 2", text: "We've carefully reviewed your account activity. Everything was processed correctly. We're unable to issue a refund, but we're happy to clarify any part of the transaction." },
          { type: "Response 3", text: "The review has been completed by both Technical and Risk teams. Findings confirm no system error. Decision is final as per platform policy." },
          { type: "Response 4", text: "We understand this may be frustrating 🙏 However, based on verified system data, no error occurred. Refunds are only issued where a confirmed system fault is identified." }
        ]
      },
      {
        title: "Persistent Argument — Loop Breaker",
        triggers: ["argument", "not fair", "outcome", "final", "loop"],
        responses: [
          { type: "Response 1", text: "We've shared the findings based on system data. If you have new details not yet reviewed, we can look again. Otherwise the outcome remains final." },
          { type: "Response 2", text: "At this stage, the outcome remains final based on verified records. We understand this may not be the answer you were hoping for." },
          { type: "Response 3", text: "We understand your position 🙏 However, the decision is based on system logs and cannot be changed. If new information becomes available, please share it and we will review." }
        ]
      },
      {
        title: "Threatening Client — 'I'll Report You'",
        triggers: ["report you", "lawyer", "authority", "escalate", "cooperate"],
        responses: [
          { type: "Response 1", text: "We understand your concern. You are free to escalate through appropriate channels. We will fully cooperate and provide all system logs for transparency." },
          { type: "Response 2", text: "We take all concerns seriously. Our systems are fully auditable and compliant. We're confident in the review outcome." },
          { type: "Response 3", text: "You're welcome to escalate. Our records clearly show the full transaction flow. We will support any formal review without reservation." }
        ]
      },
      {
        title: "Suspected Fraud / Bonus Abuse",
        triggers: ["fraud", "bonus abuse", "irregular", "restricted", "fair use"],
        responses: [
          { type: "Standard", text: "Following a full review of the account activity, our Risk team has flagged irregular behaviour consistent with bonus abuse. Withdrawal access has been restricted pending further review. We will communicate the outcome once the review is complete." },
          { type: "Alt", text: "Our systems have detected activity that does not align with our platform's fair use policy. A review is in progress and we will update you on the outcome. Thank you for your patience." }
        ]
      }
    ]
  }
];

async function seed() {
  console.log("🚀 Starting Major Seeding Process...");

  // 1. Clear existing templates to avoid duplicates (optional but recommended for clean slate)
  const { error: deleteError } = await supabase.from('support_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) console.error("❌ Delete Error:", deleteError);

  // 2. Insert new structure
  for (const cat of categories) {
    console.log(`📦 Seeding Category: ${cat.category}`);
    const { error: insertError } = await supabase
      .from('support_templates')
      .insert({
        category: cat.category,
        templates: cat.templates
      });

    if (insertError) {
      console.error(`❌ Error inserting ${cat.category}:`, insertError);
    } else {
      console.log(`✅ Successfully seeded ${cat.category}`);
    }
  }

  console.log("🏁 Seeding Complete!");
}

seed();
