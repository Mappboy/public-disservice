import os.path
import pickle
from collections import namedtuple

from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from pylatex import Document, TikZ
from pylatex.base_classes import CommandBase
from pylatex.basic import LargeText
from pylatex.package import Package
from pylatex.position import VerticalSpace, HorizontalSpace, Center
from pylatex.utils import bold

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
# The ID and range of a sample spreadsheet.
CARDS_SPREADSHEET_ID = '16yxrlTSXQqHBAVXlUrRW8oxwCtuEDekdVirzZU7D_XI'
PROJECTS_RANGE_NAME = 'Projects'
CARDS_RANGE_NAME = 'Cards'


# Basic Card Types
class CardBackground(CommandBase):
    _latex_name = 'cardbackground'
    packages = [Package('lib/pubdiscard'), Package('comicneue')]


class CardTitle(CommandBase):
    _latex_name = 'cardtitle'
    packages = [Package('lib/pubdiscard')]


class CardContent(CommandBase):
    _latex_name = 'cardcontent'
    packages = [Package('lib/pubdiscard')]


class CardPrice(CommandBase):
    _latex_name = 'cardprice'
    packages = [Package('lib/pubdiscard')]


class CardBorder(CommandBase):
    _latex_name = 'cardborder'
    packages = [Package('lib/pubdiscard')]


# PD Card Types
class CardTypeAdditionalResponsiblities(CommandBase):
    _latex_name = 'CardTypeAdditionalResponsiblities'
    packages = [Package('lib/pubdiscard')]


class CardtypeAgendaItems(CommandBase):
    _latex_name = 'CardtypeAgendaItems'
    packages = [Package('lib/pubdiscard')]


class CardtypeMachinaryOfGovernment(CommandBase):
    _latex_name = 'CardtypeMachinaryOfGovernment'
    packages = [Package('lib/pubdiscard')]


class CardtypeOfficePolitics(CommandBase):
    _latex_name = 'CardtypeOfficePolitics'
    packages = [Package('lib/pubdiscard')]


class CardtypeInActions(CommandBase):
    _latex_name = 'CardtypeInActions'
    packages = [Package('lib/pubdiscard')]


class CardtypeResumeBoosters(CommandBase):
    _latex_name = 'CardtypeResumeBoosters'
    packages = [Package('lib/pubdiscard')]


class CardtypeProject(CommandBase):
    _latex_name = 'CardtypeProject'
    packages = [Package('lib/pubdiscard')]


Card = namedtuple('Card', ["img", "tex_command", "values"])
CARD_TYPES = {
    "Additional Responsibilities": Card("lib/card/img/additionalResponsibilities.jpg",
                                        CardTypeAdditionalResponsiblities, []),
    "Agenda Items": Card("lib/card/img/agenda.jpg", CardtypeAgendaItems, []),
    "Office Politics": Card("lib/card/img/officePolitics.jpg", CardtypeOfficePolitics, []),
    "Machinery of Government": Card("lib/card/img/machinaryofgovernment2.png", CardtypeMachinaryOfGovernment, []),
    "inActions": Card("lib/card/img/inActions.jpg", CardtypeInActions, []),
    "Resume Boosters": Card("lib/card/img/resumeBoosters.jpg", CardtypeResumeBoosters, []),
    "Project": Card("lib/card/img/project.png", CardtypeProject, []),
}
CARD_HEADER = ['Quantity',
               'Name',
               'Category',
               'Description/illustration',
               'Effect',
               'Development Value']

PROJ_HEADER = ['Project',
 'Description',
 'Development points',
 'Requirements',
 'Analysing',
 'Budgeting',
 'Planning',
 'Writing']

def create_tex_file(doc_name, card_group):
    geometry_options = {"margin":"6mm","top":"5mm"}
    doc = Document(f"output", document_options=["a4paper", "portait"], geometry_options=geometry_options)
    title = bold(doc_name)
    page_title = LargeText(title)
    with doc.create(Center()):
        doc.append(page_title)
    with doc.create(Center()):
        # doc.change_page_style("empty")
        img, tex_cmd, cards = card_group
        for i, card in enumerate(cards):
            if i % 3 == 0 and i != 0:
                doc.append(VerticalSpace('2mm', star=False))
            with doc.create(TikZ()) as pic:

                pic.append(CardBackground(img))
                pic.append(tex_cmd(doc_name))
                if not doc_name == "Project":
                    pic.append(CardTitle(card["Name"]))
                    pic.append(CardContent(arguments=[card["Description/illustration"], card["Effect"]]))
                else:
                    pic.append(CardTitle( card["Requirements"]))
                    pic.append(CardContent(arguments=[card["Project"],card["Description"]]))
                price = card.get("Development Value")
                if price:
                    pic.append(CardPrice(price))
                pic.append(CardBorder())
            if not (i + 1 % 3 == 0) or i == 0:
                doc.append(HorizontalSpace('5mm',star=False))

    doc.generate_pdf(f"{doc_name}", clean_tex=True)
    move_docs2output(doc_name)

def move_docs2output(doc_name):
    """
    PyLatex get's tempremental about file paths so manually move them
    :return:
    """
    import shutil, glob
    for f in glob.glob(f"{doc_name}*"):
        output_file = os.path.join("output", f)
        if os.path.isfile(output_file):
            os.remove(output_file)
        shutil.move(f, "output")


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

    proj_result = sheet.values().get(spreadsheetId=CARDS_SPREADSHEET_ID,
                                     range=PROJECTS_RANGE_NAME).execute()
    proj_values = proj_result.get('values', [])

    if not values:
        print('No data found.')
    else:
        # Append all values to our CARD_TYPES for processing
        for idx, row in enumerate(values):
            if idx == 0:
                continue
            row_dict = dict(zip(CARD_HEADER, row))
            category = row_dict.get("Category")
            if not category:
                raise Exception(f"Failed to get category f{row_dict}")
            CARD_TYPES[category].values.append(row_dict)

    if not proj_values:
        print('No data found.')
    else:
        # Append all values to our CARD_TYPES for processing
        for idx, row in enumerate(proj_values):
            if idx == 0:
                continue
            row_dict = dict(zip(PROJ_HEADER, row))
            category = "Project"
            CARD_TYPES[category].values.append(row_dict)

    for doc_name, items in CARD_TYPES.items():
        create_tex_file(doc_name, items)


if __name__ == '__main__':
    main()
