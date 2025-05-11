try:
    # coincurve
    from .create_signature_ab.optimized import create_signature_ab
except ImportError:
    from .create_signature_ab.base import create_signature_ab
