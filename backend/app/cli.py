import click
from flask.cli import with_appcontext
from werkzeug.security import generate_password_hash
from app.extensions import db
from app.models.user import User


@click.command("create-admin")
@click.option("--reset", is_flag=True, help="Reset admin password if user exists")
@with_appcontext
def create_admin(reset):
    username = click.prompt("Admin username", default="admin")
    password = click.prompt("Admin password", hide_input=True, confirmation_prompt=True)

    user = db.session.query(User).filter_by(username=username).first()

    if user:
        if not reset:
            click.echo("❌ Admin already exists (use --reset to change password)")
            return
        user.password_hash = generate_password_hash(password)
        db.session.commit()
        click.echo("🔁 Admin password reset successfully")
        return

    admin = User(
        username=username,
        password_hash=generate_password_hash(password),
        role="admin"
    )
    db.session.add(admin)
    db.session.commit()
    click.echo("✅ Admin created successfully")

