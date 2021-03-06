import configparser
import os


class Config(configparser.ConfigParser):
    """
    TODO
    """

    def __init__(self):
        configparser.ConfigParser.__init__(self)
        self.path = os.environ["ASTEROID_CONFIG_PATH"]
        self.read(self.path)

    def getval(self, section, option, raw=False):
        """
        TODO

        :param section:
        :param option:
        :param raw:
        :return:
        """
        val = super().get(section, option)
        if not raw:
            val = self._convert(val)
        return val

    def _convert(self, val):
        """
        TODO

        :param val:
        :return:
        """
        def tryfunc(func):
            try:
                _val = func(val)
            except:
                return None
            else:
                return _val
        for func in [float, int, str]:
            ret = tryfunc(func)
            if ret != None:
                break
        return ret
