from eth_account import Account
from eth_account.messages import encode_defunct
from web3.auto import w3


def create_signature_ab(private_key_ab_hex, recipient, data) -> tuple[str, str, str]:
    """[UTILS][TX-BUILDER]

    sign in PoW.sol specific format

    private_key_ab_hex -- accepts both WITH and WITHOUT "0x"

    Works around 5ms
    Much simpler to use, because it is basically a part of web3py
    feel free to fallback to this option if optimized one doesn't work!
    """
    recipient = w3.to_checksum_address(recipient)
    message_hash = w3.solidity_keccak(["address", "bytes"], [recipient, data])
    eip191_message = encode_defunct(primitive=message_hash)
    signed_message = Account.sign_message(
        eip191_message, private_key=private_key_ab_hex
    )

    r = hex(signed_message.r)
    s = hex(signed_message.s)
    v = hex(signed_message.v)
    return r, s, v
