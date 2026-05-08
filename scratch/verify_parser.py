
# Verify the new parser logic against the real transaction data
import re
from datetime import datetime, timedelta

test_data = """20350351	Cash Back	KSH 63.00	KSH 63.00	—	5/7/2026, 8:34:28 PM
20334993	Deposit	+KSH 100.00	KSH 100.00	—	5/7/2026, 5:49:55 PM
20294720	Deposit	+KSH 500.00	KSH 509.00	—	5/6/2026, 9:47:26 PM
20285721	Cash Back	KSH 5.00	KSH 9.00	—	5/6/2026, 8:34:38 PM
20221743	Cash Back	KSH 57.00	KSH 61.00	—	5/5/2026, 8:31:23 PM
20195937	Deposit	+KSH 100.00	KSH 104.00	—	5/5/2026, 10:53:06 AM
20171494	Deposit	+KSH 200.00	KSH 209.00	—	5/4/2026, 8:54:54 PM
20169344	Cash Back	KSH 371.00	KSH 374.00	—	5/4/2026, 8:35:00 PM
20148997	Deposit	+KSH 500.00	KSH 501.00	—	5/4/2026, 3:50:05 PM
20148688	Deposit	+KSH 1,000.00	KSH 1,090.00	—	5/4/2026, 3:42:23 PM
20118487	Deposit	+KSH 400.00	KSH 400.00	—	5/3/2026, 10:00:51 PM
20114517	Deposit	+KSH 1,000.00	KSH 1,067.00	—	5/3/2026, 8:54:30 PM
20114356	Deposit	+KSH 800.00	KSH 806.00	—	5/3/2026, 8:52:04 PM
20113726	withdraw	-KSH 2,000.00	KSH 465.00	—	5/3/2026, 8:42:54 PM"""

def parse_amount_new(line):
    """New regex-based approach matching portal format"""
    m = re.search(r'[+-]?\s*KSH\s+([0-9,]+(?:\.[0-9]{1,2})?)', line, re.IGNORECASE)
    if m:
        return float(m.group(1).replace(',', ''))
    # Fallback
    m2 = re.search(r'\b([0-9,]+\.[0-9]{2})\b', line)
    if m2:
        return float(m2.group(1).replace(',', ''))
    return 0

def classify(line):
    lower = line.lower()
    if 'cash back' in lower or 'cashback' in lower:
        return 'cashback', 'Cash Back'
    elif 'admin deposit' in lower:
        return 'deposit', 'Admin Deposit'
    elif 'withdraw' in lower:
        return 'withdrawal', 'Withdrawal'
    elif 'deposit' in lower:
        return 'deposit', 'Deposit'
    return 'other', 'Unknown'

def parse_date(line):
    m = re.search(r'\d{1,2}/\d{1,2}/\d{4},?\s+\d{1,2}:\d{2}:\d{2}\s+(?:AM|PM)', line, re.IGNORECASE)
    if m:
        ds = m.group(0).replace(',', '')
        return datetime.strptime(ds, '%m/%d/%Y %I:%M:%S %p')
    return None

print("=== Parsing Verification ===\n")
transactions = []
for line in test_data.strip().split('\n'):
    tx_type, raw = classify(line)
    amount = parse_amount_new(line)
    dt = parse_date(line)
    transactions.append((tx_type, raw, amount, dt, line.split('\t')[0]))
    print(f"ID: {line.split(chr(9))[0]:<12} | Type: {raw:<12} | Amount: {amount:>10,.2f} | Ignored: {tx_type == 'cashback'}")

# Cycle breakdown
print("\n=== Cycle Breakdown (8:30 PM → 8:30 PM) ===\n")
cycles = {}
CUTOFF_H, CUTOFF_M = 20, 30

for tx_type, raw, amount, dt, tx_id in transactions:
    if tx_type == 'cashback' or not dt:
        continue
    cutoff = dt.replace(hour=CUTOFF_H, minute=CUTOFF_M, second=0, microsecond=0)
    if dt > cutoff:
        cycle_end = (dt + timedelta(days=1)).replace(hour=CUTOFF_H, minute=CUTOFF_M, second=0, microsecond=0)
    else:
        cycle_end = cutoff
    key = cycle_end.strftime('%Y-%m-%d')
    if key not in cycles:
        cycles[key] = {'end': cycle_end, 'dep': 0, 'with': 0}
    if tx_type == 'deposit':
        cycles[key]['dep'] += amount
    elif tx_type == 'withdrawal':
        cycles[key]['with'] += amount

expected_cashbacks = {}
for key in sorted(cycles.keys()):
    c = cycles[key]
    net_loss = max(0, c['dep'] - c['with'])
    expected_cb = round(net_loss * 0.1, 2)
    expected_cashbacks[c['end']] = expected_cb
    print(f"Cycle → {c['end'].strftime('%b %d')} 8:30 PM")
    print(f"  Deposits:     KSH {c['dep']:>10,.2f}")
    print(f"  Withdrawals:  KSH {c['with']:>10,.2f}")
    print(f"  Net Loss:     KSH {net_loss:>10,.2f}")
    print(f"  ✅ CORRECT CB: KSH {expected_cb:>10,.2f}")
    print()
