
from datetime import datetime, timedelta

data = """
20350351	Cash Back	KSH 63.00	KSH 63.00	—	5/7/2026, 8:34:28 PM
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
20113726	withdraw	-KSH 2,000.00	KSH 465.00	—	5/3/2026, 8:42:54 PM
"""

# I should add the one from the image too:
# 20110304 Cash Back 318.00 5/3/2026 8:33:57 PM

lines = data.strip().split("\n")
transactions = []

def parse_amount(s):
    s = s.replace("KSH", "").replace("+", "").replace("-", "").replace(",", "").strip()
    return float(s)

for line in lines:
    parts = line.split("\t")
    tx_id = parts[0]
    tx_type = parts[1].strip().lower()
    amount = parse_amount(parts[2])
    date_str = parts[5].strip()
    # Format: 5/7/2026, 8:34:28 PM
    dt = datetime.strptime(date_str, "%m/%d/%Y, %I:%M:%S %p")
    transactions.append({"id": tx_id, "type": tx_type, "amount": amount, "date": dt})

# Group into cycles
# Cycle end is 8:30 PM (20:30:00)
# Transactions after 8:30 PM belong to the NEXT day's cycle
# Example: 5/7 8:34 PM is the end of the 5/7 cycle (actually it's the reward for the 5/6-5/7 cycle)

cycles = {}

for tx in transactions:
    if tx["type"] == "cash back":
        continue
    
    # Calculate which cycle this transaction belongs to
    # A transaction on 5/7 at 5:00 PM belongs to the cycle ending 5/7 8:30 PM
    # A transaction on 5/7 at 9:00 PM belongs to the cycle ending 5/8 8:30 PM
    
    cutoff = tx["date"].replace(hour=20, minute=30, second=0, microsecond=0)
    if tx["date"] > cutoff:
        cycle_end = (tx["date"] + timedelta(days=1)).replace(hour=20, minute=30, second=0, microsecond=0)
    else:
        cycle_end = cutoff
    
    cycle_key = cycle_end.strftime("%Y-%m-%d")
    if cycle_key not in cycles:
        cycles[cycle_key] = {"dep": 0, "with": 0, "end": cycle_end}
    
    if "deposit" in tx["type"]:
        cycles[cycle_key]["dep"] += tx["amount"]
    elif "withdraw" in tx["type"]:
        cycles[cycle_key]["with"] += tx["amount"]

print("Cycle Audit Report:")
print("-" * 50)
for key in sorted(cycles.keys()):
    c = cycles[key]
    net_loss = max(0, c["dep"] - c["with"])
    expected_cb = net_loss * 0.1
    print(f"Cycle Ending: {c['end']}")
    print(f"  Deposits:    {c['dep']:,.2f}")
    print(f"  Withdrawals: {c['with']:,.2f}")
    print(f"  Net Loss:    {net_loss:,.2f}")
    print(f"  Expected CB: {expected_cb:,.2f}")
    
    # Find the actual CB recorded for this cycle
    # The CB for a cycle ending at 8:30 PM is usually recorded minutes later
    actual_cb = None
    for tx in transactions:
        if tx["type"] == "cash back":
            # If the CB is within an hour after the cutoff
            if tx["date"] > c["end"] and tx["date"] < c["end"] + timedelta(hours=1):
                actual_cb = tx["amount"]
                break
    
    if actual_cb is not None:
        print(f"  Actual CB:   {actual_cb:,.2f}")
        diff = actual_cb - expected_cb
        if abs(diff) > 0.01:
            print(f"  *** INACCURACY DETECTED: Diff of {diff:,.2f} ***")
    else:
        print("  Actual CB:   Not found in data")
    print("-" * 50)
