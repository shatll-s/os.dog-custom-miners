import logging
import os

from dotenv import load_dotenv
from eth_account import Account
from eth_utils import is_same_address
from web3 import Web3


logging.basicConfig(
    level=os.getenv("LOGLEVEL", "INFO"),
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

load_dotenv()

validation_errors = []


MASTER_PKEY = os.getenv("MASTER_PKEY")
MASTER_ADDRESS = os.getenv("MASTER_ADDRESS")
REWARDS_RECIPIENT_ADDRESS = os.getenv("REWARDS_RECIPIENT_ADDRESS")

if MASTER_PKEY is None:
    print(
        "Configuration error: MASTER_PKEY is missing. Please set it in your .env file."
    )
    exit(0)

try:
    master = Account.from_key(MASTER_PKEY)
except Exception:
    pk = MASTER_PKEY[:4] + "*" * (len(MASTER_PKEY) - 8) + MASTER_PKEY[-4:]
    print(
        f"Configuration error: The value provided for MASTER_PKEY ({pk}) is not a valid private key."
    )
    exit(0)

if MASTER_ADDRESS is None:
    MASTER_ADDRESS = master.address
if REWARDS_RECIPIENT_ADDRESS is None:
    REWARDS_RECIPIENT_ADDRESS = master.address

if not is_same_address(MASTER_ADDRESS, master.address):
    print(
        "Configuration error: MASTER_ADDRESS is deprecated. Please remove it from your .env file."
    )
    exit(0)

if not is_same_address(master.address, REWARDS_RECIPIENT_ADDRESS):
    print(
        f"[WARNING]: Make sure you have access to the REWARDS_RECIPIENT_ADDRESS ({REWARDS_RECIPIENT_ADDRESS})."
    )

INFINITY_RPC = os.getenv("INFINITY_RPC")
INFINITY_WS = os.getenv("INFINITY_WS")
try:
    w3 = Web3(Web3.HTTPProvider(INFINITY_RPC))
    master_balance = w3.eth.get_balance(master.address)
except Exception:
    print(
        f"Connection error: Unable to establish a connection with INFINITY_RPC ({INFINITY_RPC})."
    )
    exit(0)

if master_balance < 10e18:
    print(
        f"[WARNING]: Current master balance is {master_balance/1e18:.2f} $S. Consider topping it up."
    )
