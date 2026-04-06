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