import coincurve
from eth_account.messages import defunct_hash_message
from web3.auto import w3


def create_signature_ab(private_key_ab_hex, recipient, data):
    """[UTILS][TX-BUILDER]

    sign in PoW.sol specific format

    private_key_ab_hex -- no "0x"

    Optimized verison, works around 1 ms

    recipient HAS to be checksumed address!

    if you have any promlem with coincurve library (it's not always easy to install -- uncomment and use the function above)
    """

    private_key_bytes = bytes.fromhex(private_key_ab_hex)
    message_hash = w3.solidity_keccak(["address", "bytes"], [recipient, data])
    eip191_message_hash = defunct_hash_message(primitive=message_hash)
    private_key = coincurve.PrivateKey(private_key_bytes)
    signature = private_key.sign_recoverable(eip191_message_hash, hasher=None)
    r = hex(int.from_bytes(signature[:32], "big"))
    s = hex(int.from_bytes(signature[32:64], "big"))
    v = hex(signature[64] + 27)

    return r, s, v
