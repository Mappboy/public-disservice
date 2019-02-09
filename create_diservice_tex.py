import pickle
import os.path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from pylatex.base_classes import Environment, CommandBase, Arguments
from pylatex.package import Package
from pylatex import Document, Section, UnsafeCommand, TikZ
from pylatex.utils import NoEscape, bold
from pylatex.position import VerticalSpace,  HorizontalSpace,Center
from pylatex.basic import  LargeText
from collections import namedtuple
# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
# The ID and range of a sample spreadsheet.
CARDS_SPREADSHEET_ID = '16yxrlTSXQqHBAVXlUrRW8oxwCtuEDekdVirzZU7D_XI'
PROJECTS_RANGE_NAME = 'Projects'
CARDS_RANGE_NAME = 'Cards'


# Basic Card Types
class CardBackground(CommandBase):
    _latex_name = 'cardbackground'
    packages = [Package('rpg-card'), Package('comicneue')]

class cardTitle(CommandBase):
    _latex_name = 'cardtitle'
    packages = [Package('rpg-card')]

class cardContent(CommandBase):
    _latex_name = 'cardcontent'
    packages = [Package('rpg-card')]


class cardPrice(CommandBase):
    _latex_name = 'cardcontent'
    packages = [Package('rpg-card')]

# PD Card Types 
class cardTypeAdditionalResponsiblities(CommandBase):
    _latex_name = 'cardTypeAdditionalResponsiblities'
    packages = [Package('rpg-card')]

class cardtypeAgendaItems(CommandBase):
    _latex_name = 'cardtypeAgendaItems'
    packages = [Package('rpg-card')]

class cardtypeMachinaryOfGovernment(CommandBase):
    _latex_name = 'cardtypeMachinaryOfGovernment'
    packages = [Package('rpg-card')]

class cardtypeOfficePolitics(CommandBase):
    _latex_name = 'cardtypeOfficePolitics'
    packages = [Package('rpg-card')]

class cardtypeInActions(CommandBase):
    _latex_name = 'cardtypeInActions'
    packages = [Package('rpg-card')]

class cardtypeResumeBoosters(CommandBase):
    _latex_name = 'cardtypeResumeBoosters'
    packages = [Package('rpg-card')]

class cardtypeProject(CommandBase):
    _latex_name = 'cardtypeProject'
    packages = [Package('rpg-card')]

Card = namedtuple('Card', ["img", "tex_command", "values"])
CARD_TYPES = {
    "Additional Responsibilities":Card("lib/card/img/additionalResponsibilities.jpg",cardTypeAdditionalResponsiblities, []) ,
    "Agenda Items":Card("lib/card/img/agenda.jpg",cardtypeAgendaItems, []),
    "Office Politics":Card("lib/card/img/officePolitics.jpg",cardtypeOfficePolitics, []),
    "Machinery of Government":Card("lib/card/img/machinaryofgovernment2.png",cardtypeMachinaryOfGovernment, []),
    "inActions":Card("lib/card/img/inActions.jpg",cardtypeInActions, []),
    "Resume Boosters":Card("lib/card/img/resumeBoosters.jpg", cardtypeResumeBoosters, []),
    "Project":Card("lib/card/img/project.png", cardtypeProject, []),
}
CARD_HEADER = ['Quantity',
 'Name',
 'Category',
 'Description/illustration',
 'Effect',
 'Development Value']


def create_tex_file(doc_name, values):
    doc = Document(doc_name,document_options={})
    title = bold(doc_name)
    page_title = LargeText(title)
    with doc.create(Center()):
         doc.append(page_title)
    with doc.create(Center()):
        with doc.create(Tikz()):
            for i,row in enumerate(values):
                row["Name"]
                if i % 3 == 0:
                    VerticalSpace('2mm')
                else:
                    HorizontalSpace('5mm')

    doc.generate_pdf(doc_name, clean_tex=False)

def main():
    """Shows basic usage of the Sheets API.
    Prints values from a sample spreadsheet.
    """
    creds = None
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server()
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    service = build('sheets', 'v4', credentials=creds)

    # Call the Sheets API
    sheet = service.spreadsheets()
    result = sheet.values().get(spreadsheetId=CARDS_SPREADSHEET_ID,
                                range=CARDS_RANGE_NAME).execute()
    values = result.get('values', [])
    # Should be using pandas data frame here. 
    # To make sure types are sorted and unique

    if not values:
        print('No data found.')
    else:
        # Append all values to our CARD_TYPES for processing
        for idx, row in enumerate(values):
            if idx == 0:
                pass
            row_dict = dict(zip(row, CARD_HEADER))
            CARD_TYPES[row_dict["Category"]].values.append(row_dict)

        for doc_name, items in CARD_TYPES:
            create_tex_file(doc_name, [])

if __name__ == '__main__':
    main()