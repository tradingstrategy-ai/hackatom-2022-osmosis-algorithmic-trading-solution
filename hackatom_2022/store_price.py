"""Fetch price data from TheGraph and save it locally.


https://github.com/miohtama/hackatom-2022

https://thegraph.com/hosted-service/subgraph/miohtama/hackatom-2022

https://thegraph.com/docs/en/querying/graphql-api/#filtering
"""
import csv
import sys
import re

import requests
import datetime


def clean_amount(s) -> int:
    """Handle various error cases with TheGraph data.
    93602571301935242gamm/p
    """
    if s is None:
        return -1
    s = re.search(r'\d+',s).group()
    price = int(s)
    return price


# This was grabbed from aavescan
example_query = """
{
  "variables": {
    "reserve": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb480xb53c1a33016b2dc2ff3653530bff1848a515c8c5"
  },

  "query": "query ($reserve: String!) {
    t1634842615: reserveParamsHistoryItems(
        first: 1, where: {reserve: $reserve, timestamp_gt: 1634842615, timestamp_lt: 1634851415}) {
        liquidityRate
        priceInUsd
        timestamp
        __typename 
    }"
}
 """

# For each timestamp we add one query item
TEMPLATE = """
{{
        tokenSwaps(
            first: {max_rows}, 
            where: {{ timestamp_gte: {timestamp_start}, timestamp_lt: {timestamp_end} }}
            ) {{
            id
            blockNumber
            timestamp
            poolId
            tokenIn {{
              amount
              denom
            }}
            tokenOut {{
              amount
              denom
            }}
        }}
}}
"""

# https://thegraph.com/hosted-service/subgraph/miohtama/hackatom-2022
url = "https://api.thegraph.com/subgraphs/name/miohtama/hackatom-2022"

# Looks like no earlier data available
# GMT: Saturday, December 25, 2021 12:12:25 AM
start = datetime.datetime(2021, 12, 25, tzinfo=datetime.timezone.utc)
# start = datetime.datetime(2020, 7, 13, tzinfo=datetime.timezone.utc)
end = datetime.datetime(2022, 7, 1, tzinfo=datetime.timezone.utc)
delta = datetime.timedelta(hours=0.5)

# Max number of swaps to be fetch for one hour
max_rows = 1000

columns = "block_number,timestamp,pool_id,token_in,token_out,token_in_amount,token_out_amount".split(",")
out = open("swaps.csv", "wt")
writer = csv.DictWriter(out, fieldnames=columns, delimiter=",")
writer.writeheader()

# Iterate over data day by day
cursor = start
while cursor < end:

    timestamp_start = int(cursor.timestamp())
    timestamp_end = int((cursor + delta).timestamp())

    query_payload = TEMPLATE.format(max_rows=max_rows, timestamp_start=timestamp_start, timestamp_end=timestamp_end)

    body = {
        "variables": None,
        "query": query_payload
    }

    resp = requests.post(url, json=body)
    assert resp.status_code == 200, f"Got status {resp.status_code}: {resp.text}"
    out = resp.json()
    # Problemos?
    if "errors" in out:
        print(query_payload)
        print(out)
        sys.exit()

    data = out["data"]
    swaps = data["tokenSwaps"]

    out_swaps = []

    for s in swaps:
        o = {}
        o["timestamp"] = int(s["timestamp"])
        o["block_number"] = int(s["blockNumber"])
        o["pool_id"] = int(s["poolId"])
        o["token_in"] = s["tokenIn"]["denom"]
        o["token_out"] = s["tokenOut"]["denom"]
        o["token_in_amount"] = clean_amount(s["tokenIn"]["amount"])
        o["token_out_amount"] = clean_amount(s["tokenOut"]["amount"])
        out_swaps.append(o)

    out_swaps = sorted(out_swaps, key=lambda s:s["timestamp"])

    if out_swaps:
        first_swap = datetime.datetime.utcfromtimestamp(out_swaps[0]["timestamp"])
        last_swap = datetime.datetime.utcfromtimestamp(out_swaps[-1]["timestamp"])
        print(f"Timestamp {cursor}: {len(out_swaps)} swaps, first at:{first_swap}, last at: {last_swap}")

        writer.writerows(out_swaps)

        if len(out_swaps) == max_rows:
            print("Too many rows - decrease delta or increase max_rows limit")
    else:
        print(f"Timestamp {cursor}: {len(swaps)} swaps")

    cursor += delta





