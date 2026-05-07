class IssueNotFound(Exception):
    pass


class IssueAlreadyClosed(Exception):
    pass


class ComplaintNotFound(Exception):
    pass


class ComplaintAlreadyClosed(Exception):
    pass


class AccessDenied(Exception):
    pass


class EventNotFound(Exception):
    pass


class EventAccessDenied(Exception):
    pass


class QRCodeNotFound(Exception):
    pass


class QRCodeNotActive(Exception):
    pass


class QRCodeAccessDenied(Exception):
    pass
