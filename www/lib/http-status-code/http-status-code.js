var Q = Object.create;
var C = Object.defineProperty;
var Y = Object.getOwnPropertyDescriptor;
var f = Object.getOwnPropertyNames;
var g = Object.getPrototypeOf,
  p = Object.prototype.hasOwnProperty;
var A = (E, O) => () => (O || E((O = { exports: {} }).exports, O), O.exports);
var n = (E, O, _, N) => {
    if ((O && typeof O == 'object') || typeof O == 'function')
      for (let I of f(O))
        !p.call(E, I) && I !== _ && C(E, I, { get: () => O[I], enumerable: !(N = Y(O, I)) || N.enumerable });
    return E;
  },
  t = (E, O, _) => (n(E, O, 'default'), _ && n(_, O, 'default')),
  B = (E, O, _) => (
    (_ = E != null ? Q(g(E)) : {}), n(O || !E || !E.__esModule ? C(_, 'default', { value: E, enumerable: !0 }) : _, E)
  );
var P = A((T) => {
  'use strict';
  Object.defineProperty(T, '__esModule', { value: !0 });
  T.USE_PROXY =
    T.UNSUPPORTED_MEDIA_TYPE =
    T.UNPROCESSABLE_ENTITY =
    T.UNAUTHORIZED =
    T.TOO_MANY_REQUESTS =
    T.TEMPORARY_REDIRECT =
    T.SWITCHING_PROTOCOLS =
    T.SERVICE_UNAVAILABLE =
    T.SEE_OTHER =
    T.RESET_CONTENT =
    T.REQUESTED_RANGE_NOT_SATISFIABLE =
    T.REQUEST_URI_TOO_LONG =
    T.REQUEST_TOO_LONG =
    T.REQUEST_TIMEOUT =
    T.REQUEST_HEADER_FIELDS_TOO_LARGE =
    T.PROXY_AUTHENTICATION_REQUIRED =
    T.PROCESSING =
    T.PRECONDITION_REQUIRED =
    T.PRECONDITION_FAILED =
    T.PERMANENT_REDIRECT =
    T.PAYMENT_REQUIRED =
    T.PARTIAL_CONTENT =
    T.OK =
    T.NOT_MODIFIED =
    T.NOT_IMPLEMENTED =
    T.NOT_FOUND =
    T.NOT_ACCEPTABLE =
    T.NON_AUTHORITATIVE_INFORMATION =
    T.NO_CONTENT =
    T.NETWORK_AUTHENTICATION_REQUIRED =
    T.MULTIPLE_CHOICES =
    T.MULTI_STATUS =
    T.MOVED_TEMPORARILY =
    T.MOVED_PERMANENTLY =
    T.METHOD_NOT_ALLOWED =
    T.METHOD_FAILURE =
    T.LOCKED =
    T.LENGTH_REQUIRED =
    T.INTERNAL_SERVER_ERROR =
    T.INSUFFICIENT_STORAGE =
    T.INSUFFICIENT_SPACE_ON_RESOURCE =
    T.IM_A_TEAPOT =
    T.HTTP_VERSION_NOT_SUPPORTED =
    T.GONE =
    T.GATEWAY_TIMEOUT =
    T.FORBIDDEN =
    T.FAILED_DEPENDENCY =
    T.EXPECTATION_FAILED =
    T.CREATED =
    T.CONTINUE =
    T.CONFLICT =
    T.BAD_REQUEST =
    T.BAD_GATEWAY =
    T.ACCEPTED =
      void 0;
  T.ACCEPTED = 202;
  T.BAD_GATEWAY = 502;
  T.BAD_REQUEST = 400;
  T.CONFLICT = 409;
  T.CONTINUE = 100;
  T.CREATED = 201;
  T.EXPECTATION_FAILED = 417;
  T.FAILED_DEPENDENCY = 424;
  T.FORBIDDEN = 403;
  T.GATEWAY_TIMEOUT = 504;
  T.GONE = 410;
  T.HTTP_VERSION_NOT_SUPPORTED = 505;
  T.IM_A_TEAPOT = 418;
  T.INSUFFICIENT_SPACE_ON_RESOURCE = 419;
  T.INSUFFICIENT_STORAGE = 507;
  T.INTERNAL_SERVER_ERROR = 500;
  T.LENGTH_REQUIRED = 411;
  T.LOCKED = 423;
  T.METHOD_FAILURE = 420;
  T.METHOD_NOT_ALLOWED = 405;
  T.MOVED_PERMANENTLY = 301;
  T.MOVED_TEMPORARILY = 302;
  T.MULTI_STATUS = 207;
  T.MULTIPLE_CHOICES = 300;
  T.NETWORK_AUTHENTICATION_REQUIRED = 511;
  T.NO_CONTENT = 204;
  T.NON_AUTHORITATIVE_INFORMATION = 203;
  T.NOT_ACCEPTABLE = 406;
  T.NOT_FOUND = 404;
  T.NOT_IMPLEMENTED = 501;
  T.NOT_MODIFIED = 304;
  T.OK = 200;
  T.PARTIAL_CONTENT = 206;
  T.PAYMENT_REQUIRED = 402;
  T.PERMANENT_REDIRECT = 308;
  T.PRECONDITION_FAILED = 412;
  T.PRECONDITION_REQUIRED = 428;
  T.PROCESSING = 102;
  T.PROXY_AUTHENTICATION_REQUIRED = 407;
  T.REQUEST_HEADER_FIELDS_TOO_LARGE = 431;
  T.REQUEST_TIMEOUT = 408;
  T.REQUEST_TOO_LONG = 413;
  T.REQUEST_URI_TOO_LONG = 414;
  T.REQUESTED_RANGE_NOT_SATISFIABLE = 416;
  T.RESET_CONTENT = 205;
  T.SEE_OTHER = 303;
  T.SERVICE_UNAVAILABLE = 503;
  T.SWITCHING_PROTOCOLS = 101;
  T.TEMPORARY_REDIRECT = 307;
  T.TOO_MANY_REQUESTS = 429;
  T.UNAUTHORIZED = 401;
  T.UNPROCESSABLE_ENTITY = 422;
  T.UNSUPPORTED_MEDIA_TYPE = 415;
  T.USE_PROXY = 305;
  T.default = {
    ACCEPTED: T.ACCEPTED,
    BAD_GATEWAY: T.BAD_GATEWAY,
    BAD_REQUEST: T.BAD_REQUEST,
    CONFLICT: T.CONFLICT,
    CONTINUE: T.CONTINUE,
    CREATED: T.CREATED,
    EXPECTATION_FAILED: T.EXPECTATION_FAILED,
    FORBIDDEN: T.FORBIDDEN,
    GATEWAY_TIMEOUT: T.GATEWAY_TIMEOUT,
    GONE: T.GONE,
    HTTP_VERSION_NOT_SUPPORTED: T.HTTP_VERSION_NOT_SUPPORTED,
    IM_A_TEAPOT: T.IM_A_TEAPOT,
    INSUFFICIENT_SPACE_ON_RESOURCE: T.INSUFFICIENT_SPACE_ON_RESOURCE,
    INSUFFICIENT_STORAGE: T.INSUFFICIENT_STORAGE,
    INTERNAL_SERVER_ERROR: T.INTERNAL_SERVER_ERROR,
    LENGTH_REQUIRED: T.LENGTH_REQUIRED,
    LOCKED: T.LOCKED,
    METHOD_FAILURE: T.METHOD_FAILURE,
    METHOD_NOT_ALLOWED: T.METHOD_NOT_ALLOWED,
    MOVED_PERMANENTLY: T.MOVED_PERMANENTLY,
    MOVED_TEMPORARILY: T.MOVED_TEMPORARILY,
    MULTI_STATUS: T.MULTI_STATUS,
    MULTIPLE_CHOICES: T.MULTIPLE_CHOICES,
    NETWORK_AUTHENTICATION_REQUIRED: T.NETWORK_AUTHENTICATION_REQUIRED,
    NO_CONTENT: T.NO_CONTENT,
    NON_AUTHORITATIVE_INFORMATION: T.NON_AUTHORITATIVE_INFORMATION,
    NOT_ACCEPTABLE: T.NOT_ACCEPTABLE,
    NOT_FOUND: T.NOT_FOUND,
    NOT_IMPLEMENTED: T.NOT_IMPLEMENTED,
    NOT_MODIFIED: T.NOT_MODIFIED,
    OK: T.OK,
    PARTIAL_CONTENT: T.PARTIAL_CONTENT,
    PAYMENT_REQUIRED: T.PAYMENT_REQUIRED,
    PERMANENT_REDIRECT: T.PERMANENT_REDIRECT,
    PRECONDITION_FAILED: T.PRECONDITION_FAILED,
    PRECONDITION_REQUIRED: T.PRECONDITION_REQUIRED,
    PROCESSING: T.PROCESSING,
    PROXY_AUTHENTICATION_REQUIRED: T.PROXY_AUTHENTICATION_REQUIRED,
    REQUEST_HEADER_FIELDS_TOO_LARGE: T.REQUEST_HEADER_FIELDS_TOO_LARGE,
    REQUEST_TIMEOUT: T.REQUEST_TIMEOUT,
    REQUEST_TOO_LONG: T.REQUEST_TOO_LONG,
    REQUEST_URI_TOO_LONG: T.REQUEST_URI_TOO_LONG,
    REQUESTED_RANGE_NOT_SATISFIABLE: T.REQUESTED_RANGE_NOT_SATISFIABLE,
    RESET_CONTENT: T.RESET_CONTENT,
    SEE_OTHER: T.SEE_OTHER,
    SERVICE_UNAVAILABLE: T.SERVICE_UNAVAILABLE,
    SWITCHING_PROTOCOLS: T.SWITCHING_PROTOCOLS,
    TEMPORARY_REDIRECT: T.TEMPORARY_REDIRECT,
    TOO_MANY_REQUESTS: T.TOO_MANY_REQUESTS,
    UNAUTHORIZED: T.UNAUTHORIZED,
    UNPROCESSABLE_ENTITY: T.UNPROCESSABLE_ENTITY,
    UNSUPPORTED_MEDIA_TYPE: T.UNSUPPORTED_MEDIA_TYPE,
    USE_PROXY: T.USE_PROXY
  };
});
var F = A((U) => {
  'use strict';
  Object.defineProperty(U, '__esModule', { value: !0 });
  U.reasonPhraseToStatusCode = U.statusCodeToReasonPhrase = void 0;
  U.statusCodeToReasonPhrase = {
    202: 'Accepted',
    502: 'Bad Gateway',
    400: 'Bad Request',
    409: 'Conflict',
    100: 'Continue',
    201: 'Created',
    417: 'Expectation Failed',
    424: 'Failed Dependency',
    403: 'Forbidden',
    504: 'Gateway Timeout',
    410: 'Gone',
    505: 'HTTP Version Not Supported',
    418: "I'm a teapot",
    419: 'Insufficient Space on Resource',
    507: 'Insufficient Storage',
    500: 'Internal Server Error',
    411: 'Length Required',
    423: 'Locked',
    420: 'Method Failure',
    405: 'Method Not Allowed',
    301: 'Moved Permanently',
    302: 'Moved Temporarily',
    207: 'Multi-Status',
    300: 'Multiple Choices',
    511: 'Network Authentication Required',
    204: 'No Content',
    203: 'Non Authoritative Information',
    406: 'Not Acceptable',
    404: 'Not Found',
    501: 'Not Implemented',
    304: 'Not Modified',
    200: 'OK',
    206: 'Partial Content',
    402: 'Payment Required',
    308: 'Permanent Redirect',
    412: 'Precondition Failed',
    428: 'Precondition Required',
    102: 'Processing',
    103: 'Early Hints',
    426: 'Upgrade Required',
    407: 'Proxy Authentication Required',
    431: 'Request Header Fields Too Large',
    408: 'Request Timeout',
    413: 'Request Entity Too Large',
    414: 'Request-URI Too Long',
    416: 'Requested Range Not Satisfiable',
    205: 'Reset Content',
    303: 'See Other',
    503: 'Service Unavailable',
    101: 'Switching Protocols',
    307: 'Temporary Redirect',
    429: 'Too Many Requests',
    401: 'Unauthorized',
    451: 'Unavailable For Legal Reasons',
    422: 'Unprocessable Entity',
    415: 'Unsupported Media Type',
    305: 'Use Proxy',
    421: 'Misdirected Request'
  };
  U.reasonPhraseToStatusCode = {
    Accepted: 202,
    'Bad Gateway': 502,
    'Bad Request': 400,
    Conflict: 409,
    Continue: 100,
    Created: 201,
    'Expectation Failed': 417,
    'Failed Dependency': 424,
    Forbidden: 403,
    'Gateway Timeout': 504,
    Gone: 410,
    'HTTP Version Not Supported': 505,
    "I'm a teapot": 418,
    'Insufficient Space on Resource': 419,
    'Insufficient Storage': 507,
    'Internal Server Error': 500,
    'Length Required': 411,
    Locked: 423,
    'Method Failure': 420,
    'Method Not Allowed': 405,
    'Moved Permanently': 301,
    'Moved Temporarily': 302,
    'Multi-Status': 207,
    'Multiple Choices': 300,
    'Network Authentication Required': 511,
    'No Content': 204,
    'Non Authoritative Information': 203,
    'Not Acceptable': 406,
    'Not Found': 404,
    'Not Implemented': 501,
    'Not Modified': 304,
    OK: 200,
    'Partial Content': 206,
    'Payment Required': 402,
    'Permanent Redirect': 308,
    'Precondition Failed': 412,
    'Precondition Required': 428,
    Processing: 102,
    'Early Hints': 103,
    'Upgrade Required': 426,
    'Proxy Authentication Required': 407,
    'Request Header Fields Too Large': 431,
    'Request Timeout': 408,
    'Request Entity Too Large': 413,
    'Request-URI Too Long': 414,
    'Requested Range Not Satisfiable': 416,
    'Reset Content': 205,
    'See Other': 303,
    'Service Unavailable': 503,
    'Switching Protocols': 101,
    'Temporary Redirect': 307,
    'Too Many Requests': 429,
    Unauthorized: 401,
    'Unavailable For Legal Reasons': 451,
    'Unprocessable Entity': 422,
    'Unsupported Media Type': 415,
    'Use Proxy': 305,
    'Misdirected Request': 421
  };
});
var S = A((e) => {
  'use strict';
  Object.defineProperty(e, '__esModule', { value: !0 });
  e.getStatusText = e.getStatusCode = e.getReasonPhrase = void 0;
  var o = F();
  function c(E) {
    var O = o.statusCodeToReasonPhrase[E.toString()];
    if (!O) throw new Error('Status code does not exist: ' + E);
    return O;
  }
  e.getReasonPhrase = c;
  function d(E) {
    var O = o.reasonPhraseToStatusCode[E];
    if (!O) throw new Error('Reason phrase does not exist: ' + E);
    return O;
  }
  e.getStatusCode = d;
  e.getStatusText = c;
});
var l = A((D) => {
  'use strict';
  Object.defineProperty(D, '__esModule', { value: !0 });
  D.StatusCodes = void 0;
  var y;
  (function (E) {
    (E[(E.CONTINUE = 100)] = 'CONTINUE'),
      (E[(E.SWITCHING_PROTOCOLS = 101)] = 'SWITCHING_PROTOCOLS'),
      (E[(E.PROCESSING = 102)] = 'PROCESSING'),
      (E[(E.EARLY_HINTS = 103)] = 'EARLY_HINTS'),
      (E[(E.OK = 200)] = 'OK'),
      (E[(E.CREATED = 201)] = 'CREATED'),
      (E[(E.ACCEPTED = 202)] = 'ACCEPTED'),
      (E[(E.NON_AUTHORITATIVE_INFORMATION = 203)] = 'NON_AUTHORITATIVE_INFORMATION'),
      (E[(E.NO_CONTENT = 204)] = 'NO_CONTENT'),
      (E[(E.RESET_CONTENT = 205)] = 'RESET_CONTENT'),
      (E[(E.PARTIAL_CONTENT = 206)] = 'PARTIAL_CONTENT'),
      (E[(E.MULTI_STATUS = 207)] = 'MULTI_STATUS'),
      (E[(E.MULTIPLE_CHOICES = 300)] = 'MULTIPLE_CHOICES'),
      (E[(E.MOVED_PERMANENTLY = 301)] = 'MOVED_PERMANENTLY'),
      (E[(E.MOVED_TEMPORARILY = 302)] = 'MOVED_TEMPORARILY'),
      (E[(E.SEE_OTHER = 303)] = 'SEE_OTHER'),
      (E[(E.NOT_MODIFIED = 304)] = 'NOT_MODIFIED'),
      (E[(E.USE_PROXY = 305)] = 'USE_PROXY'),
      (E[(E.TEMPORARY_REDIRECT = 307)] = 'TEMPORARY_REDIRECT'),
      (E[(E.PERMANENT_REDIRECT = 308)] = 'PERMANENT_REDIRECT'),
      (E[(E.BAD_REQUEST = 400)] = 'BAD_REQUEST'),
      (E[(E.UNAUTHORIZED = 401)] = 'UNAUTHORIZED'),
      (E[(E.PAYMENT_REQUIRED = 402)] = 'PAYMENT_REQUIRED'),
      (E[(E.FORBIDDEN = 403)] = 'FORBIDDEN'),
      (E[(E.NOT_FOUND = 404)] = 'NOT_FOUND'),
      (E[(E.METHOD_NOT_ALLOWED = 405)] = 'METHOD_NOT_ALLOWED'),
      (E[(E.NOT_ACCEPTABLE = 406)] = 'NOT_ACCEPTABLE'),
      (E[(E.PROXY_AUTHENTICATION_REQUIRED = 407)] = 'PROXY_AUTHENTICATION_REQUIRED'),
      (E[(E.REQUEST_TIMEOUT = 408)] = 'REQUEST_TIMEOUT'),
      (E[(E.CONFLICT = 409)] = 'CONFLICT'),
      (E[(E.GONE = 410)] = 'GONE'),
      (E[(E.LENGTH_REQUIRED = 411)] = 'LENGTH_REQUIRED'),
      (E[(E.PRECONDITION_FAILED = 412)] = 'PRECONDITION_FAILED'),
      (E[(E.REQUEST_TOO_LONG = 413)] = 'REQUEST_TOO_LONG'),
      (E[(E.REQUEST_URI_TOO_LONG = 414)] = 'REQUEST_URI_TOO_LONG'),
      (E[(E.UNSUPPORTED_MEDIA_TYPE = 415)] = 'UNSUPPORTED_MEDIA_TYPE'),
      (E[(E.REQUESTED_RANGE_NOT_SATISFIABLE = 416)] = 'REQUESTED_RANGE_NOT_SATISFIABLE'),
      (E[(E.EXPECTATION_FAILED = 417)] = 'EXPECTATION_FAILED'),
      (E[(E.IM_A_TEAPOT = 418)] = 'IM_A_TEAPOT'),
      (E[(E.INSUFFICIENT_SPACE_ON_RESOURCE = 419)] = 'INSUFFICIENT_SPACE_ON_RESOURCE'),
      (E[(E.METHOD_FAILURE = 420)] = 'METHOD_FAILURE'),
      (E[(E.MISDIRECTED_REQUEST = 421)] = 'MISDIRECTED_REQUEST'),
      (E[(E.UNPROCESSABLE_ENTITY = 422)] = 'UNPROCESSABLE_ENTITY'),
      (E[(E.LOCKED = 423)] = 'LOCKED'),
      (E[(E.FAILED_DEPENDENCY = 424)] = 'FAILED_DEPENDENCY'),
      (E[(E.UPGRADE_REQUIRED = 426)] = 'UPGRADE_REQUIRED'),
      (E[(E.PRECONDITION_REQUIRED = 428)] = 'PRECONDITION_REQUIRED'),
      (E[(E.TOO_MANY_REQUESTS = 429)] = 'TOO_MANY_REQUESTS'),
      (E[(E.REQUEST_HEADER_FIELDS_TOO_LARGE = 431)] = 'REQUEST_HEADER_FIELDS_TOO_LARGE'),
      (E[(E.UNAVAILABLE_FOR_LEGAL_REASONS = 451)] = 'UNAVAILABLE_FOR_LEGAL_REASONS'),
      (E[(E.INTERNAL_SERVER_ERROR = 500)] = 'INTERNAL_SERVER_ERROR'),
      (E[(E.NOT_IMPLEMENTED = 501)] = 'NOT_IMPLEMENTED'),
      (E[(E.BAD_GATEWAY = 502)] = 'BAD_GATEWAY'),
      (E[(E.SERVICE_UNAVAILABLE = 503)] = 'SERVICE_UNAVAILABLE'),
      (E[(E.GATEWAY_TIMEOUT = 504)] = 'GATEWAY_TIMEOUT'),
      (E[(E.HTTP_VERSION_NOT_SUPPORTED = 505)] = 'HTTP_VERSION_NOT_SUPPORTED'),
      (E[(E.INSUFFICIENT_STORAGE = 507)] = 'INSUFFICIENT_STORAGE'),
      (E[(E.NETWORK_AUTHENTICATION_REQUIRED = 511)] = 'NETWORK_AUTHENTICATION_REQUIRED');
  })((y = D.StatusCodes || (D.StatusCodes = {})));
});
var H = A((i) => {
  'use strict';
  Object.defineProperty(i, '__esModule', { value: !0 });
  i.ReasonPhrases = void 0;
  var V;
  (function (E) {
    (E.ACCEPTED = 'Accepted'),
      (E.BAD_GATEWAY = 'Bad Gateway'),
      (E.BAD_REQUEST = 'Bad Request'),
      (E.CONFLICT = 'Conflict'),
      (E.CONTINUE = 'Continue'),
      (E.CREATED = 'Created'),
      (E.EXPECTATION_FAILED = 'Expectation Failed'),
      (E.FAILED_DEPENDENCY = 'Failed Dependency'),
      (E.FORBIDDEN = 'Forbidden'),
      (E.GATEWAY_TIMEOUT = 'Gateway Timeout'),
      (E.GONE = 'Gone'),
      (E.HTTP_VERSION_NOT_SUPPORTED = 'HTTP Version Not Supported'),
      (E.IM_A_TEAPOT = "I'm a teapot"),
      (E.INSUFFICIENT_SPACE_ON_RESOURCE = 'Insufficient Space on Resource'),
      (E.INSUFFICIENT_STORAGE = 'Insufficient Storage'),
      (E.INTERNAL_SERVER_ERROR = 'Internal Server Error'),
      (E.LENGTH_REQUIRED = 'Length Required'),
      (E.LOCKED = 'Locked'),
      (E.METHOD_FAILURE = 'Method Failure'),
      (E.METHOD_NOT_ALLOWED = 'Method Not Allowed'),
      (E.MOVED_PERMANENTLY = 'Moved Permanently'),
      (E.MOVED_TEMPORARILY = 'Moved Temporarily'),
      (E.MULTI_STATUS = 'Multi-Status'),
      (E.MULTIPLE_CHOICES = 'Multiple Choices'),
      (E.NETWORK_AUTHENTICATION_REQUIRED = 'Network Authentication Required'),
      (E.NO_CONTENT = 'No Content'),
      (E.NON_AUTHORITATIVE_INFORMATION = 'Non Authoritative Information'),
      (E.NOT_ACCEPTABLE = 'Not Acceptable'),
      (E.NOT_FOUND = 'Not Found'),
      (E.NOT_IMPLEMENTED = 'Not Implemented'),
      (E.NOT_MODIFIED = 'Not Modified'),
      (E.OK = 'OK'),
      (E.PARTIAL_CONTENT = 'Partial Content'),
      (E.PAYMENT_REQUIRED = 'Payment Required'),
      (E.PERMANENT_REDIRECT = 'Permanent Redirect'),
      (E.PRECONDITION_FAILED = 'Precondition Failed'),
      (E.PRECONDITION_REQUIRED = 'Precondition Required'),
      (E.PROCESSING = 'Processing'),
      (E.EARLY_HINTS = 'Early Hints'),
      (E.UPGRADE_REQUIRED = 'Upgrade Required'),
      (E.PROXY_AUTHENTICATION_REQUIRED = 'Proxy Authentication Required'),
      (E.REQUEST_HEADER_FIELDS_TOO_LARGE = 'Request Header Fields Too Large'),
      (E.REQUEST_TIMEOUT = 'Request Timeout'),
      (E.REQUEST_TOO_LONG = 'Request Entity Too Large'),
      (E.REQUEST_URI_TOO_LONG = 'Request-URI Too Long'),
      (E.REQUESTED_RANGE_NOT_SATISFIABLE = 'Requested Range Not Satisfiable'),
      (E.RESET_CONTENT = 'Reset Content'),
      (E.SEE_OTHER = 'See Other'),
      (E.SERVICE_UNAVAILABLE = 'Service Unavailable'),
      (E.SWITCHING_PROTOCOLS = 'Switching Protocols'),
      (E.TEMPORARY_REDIRECT = 'Temporary Redirect'),
      (E.TOO_MANY_REQUESTS = 'Too Many Requests'),
      (E.UNAUTHORIZED = 'Unauthorized'),
      (E.UNAVAILABLE_FOR_LEGAL_REASONS = 'Unavailable For Legal Reasons'),
      (E.UNPROCESSABLE_ENTITY = 'Unprocessable Entity'),
      (E.UNSUPPORTED_MEDIA_TYPE = 'Unsupported Media Type'),
      (E.USE_PROXY = 'Use Proxy'),
      (E.MISDIRECTED_REQUEST = 'Misdirected Request');
  })((V = i.ReasonPhrases || (i.ReasonPhrases = {})));
});
var G = A((R) => {
  'use strict';
  var r =
      (R && R.__assign) ||
      function () {
        return (
          (r =
            Object.assign ||
            function (E) {
              for (var O, _ = 1, N = arguments.length; _ < N; _++) {
                O = arguments[_];
                for (var I in O) Object.prototype.hasOwnProperty.call(O, I) && (E[I] = O[I]);
              }
              return E;
            }),
          r.apply(this, arguments)
        );
      },
    q =
      (R && R.__createBinding) ||
      (Object.create
        ? function (E, O, _, N) {
            N === void 0 && (N = _),
              Object.defineProperty(E, N, {
                enumerable: !0,
                get: function () {
                  return O[_];
                }
              });
          }
        : function (E, O, _, N) {
            N === void 0 && (N = _), (E[N] = O[_]);
          }),
    v =
      (R && R.__exportStar) ||
      function (E, O) {
        for (var _ in E) _ !== 'default' && !O.hasOwnProperty(_) && q(O, E, _);
      },
    m =
      (R && R.__importDefault) ||
      function (E) {
        return E && E.__esModule ? E : { default: E };
      };
  Object.defineProperty(R, '__esModule', { value: !0 });
  var b = m(P()),
    u = S(),
    M = S();
  Object.defineProperty(R, 'getStatusCode', {
    enumerable: !0,
    get: function () {
      return M.getStatusCode;
    }
  });
  Object.defineProperty(R, 'getReasonPhrase', {
    enumerable: !0,
    get: function () {
      return M.getReasonPhrase;
    }
  });
  Object.defineProperty(R, 'getStatusText', {
    enumerable: !0,
    get: function () {
      return M.getStatusText;
    }
  });
  var a = l();
  Object.defineProperty(R, 'StatusCodes', {
    enumerable: !0,
    get: function () {
      return a.StatusCodes;
    }
  });
  var W = H();
  Object.defineProperty(R, 'ReasonPhrases', {
    enumerable: !0,
    get: function () {
      return W.ReasonPhrases;
    }
  });
  v(P(), R);
  R.default = r(r({}, b.default), { getStatusCode: u.getStatusCode, getStatusText: u.getStatusText });
});
var L = {};
t(L, B(G()));
