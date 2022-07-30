"""Fetch price data from TheGraph and save it locally.


https://github.com/miohtama/hackatom-2022

https://thegraph.com/hosted-service/subgraph/miohtama/hackatom-2022

https://thegraph.com/docs/en/querying/graphql-api/#filtering
"""

import sys
import requests
import datetime

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
        tokenSwaps(first: {max_rows}, where: {{ timestamp_gte: {timestamp_start}, timestamp_lt: {timestamp_end} }}) {{
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
start = datetime.datetime(2021, 12, 24, tzinfo=datetime.timezone.utc)
# start = datetime.datetime(2020, 7, 13, tzinfo=datetime.timezone.utc)
end = datetime.datetime(2022, 7, 1, tzinfo=datetime.timezone.utc)
delta = datetime.timedelta(hours=1)
batch_size = 5  # How many days we do in one GraphQL query

# Max number of swaps to be fetch for one hour
max_rows = 1000

csv = open("swaps.csv", "wt")
print("block_number,timestamp,pool_id,token_in,token_out,token_in_amount,token_out_amount", file=csv)

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
    for s in swaps:
        s["timestamp"] = int(s["timestamp"])
    swaps = sorted(swaps, key=lambda s:s["timestamp"])

    if swaps:
        first_swap = datetime.datetime.utcfromtimestamp(swaps[0]["timestamp"])
        last_swap = datetime.datetime.utcfromtimestamp(swaps[-1]["timestamp"])
        print(f"Timestamp {cursor}: {len(swaps)} swaps, first at:{first_swap}, last at: {last_swap}")
        import ipdb ; ipdb.set_trace()
    else:
        print(f"Timestamp {cursor}: {len(swaps)} swaps")

    cursor += delta





