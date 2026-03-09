from argparse import ArgumentParser
from obmms import OBMMS
from obmms.settings import HOST, PORT, RELOAD
import uvicorn

obmms = OBMMS()
app = obmms.app

if __name__ == "__main__":
  parser = ArgumentParser(
    prog="Online Bus Monitoring & Management System",
    description="OBMMS development entry point for running the server, creating the database schema and creating super users",
    epilog="Use [-h] or [--help] for usage instructions"
  )
  parser.add_argument("command", help="runserver | migrate | createsuperuser")
  args = parser.parse_args()

  if args.command == "runserver":
    uvicorn.run("main:app", host=HOST, port=PORT, reload=RELOAD)
  elif args.command == "migrate":
    obmms.create_tables()
  elif args.command == "createsuperuser":
    obmms.create_super_user()
  else:
    raise NotImplementedError(args.command+" is not recognized")