from app.extensions import db

class SystemSetting(db.Model):
    __tablename__ = "system_settings"

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(50), unique=True, nullable=False)
    value = db.Column(db.String(255), nullable=False)

    @staticmethod
    def get_val(key, default=None):
        setting = SystemSetting.query.filter_by(key=key).first()
        return setting.value if setting else default
