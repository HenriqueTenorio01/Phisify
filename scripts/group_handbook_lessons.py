"""Join published lesson slices without losing source blocks or historical IDs."""

def group_lessons(lessons, questions, prefix, groups):
 old={lesson['id']:lesson for lesson in lessons}
 result=[];used=[]
 for slugs,title,size in groups:
  ids=[prefix+slug for slug in slugs]
  parts=[old[id] for id in ids]
  refs=[]
  for part in parts:
   for source in part['refs']:
    ref=dict(source)
    if refs and refs[-1]['page']==ref['page'] and refs[-1].get('end')==ref.get('start',0):
     refs[-1]['end']=ref.get('end')
    else:refs.append(ref)
  # The guide includes short worksheet introductions on two other pages. Its
  # reading length is approximately two pages, not three complete PDF pages.
  estimated=len(set(r['page'] for r in refs))!=size
  result.append({**parts[0],'title':title,'description':title+'. Deduções, exemplos e condições de uso reunidos em uma leitura contínua.',
   'pages':size,'previousIds':ids,'refs':refs,**({'estimatedPages':True} if estimated else {})})
  used+=ids
 assert len(used)==len(set(used)) and set(used)==set(old), 'Groups must partition every published lesson exactly once'
 assert all(1<=l['pages']<=4 for l in result)
 destinations={oldid:lesson['id'] for lesson in result for oldid in lesson['previousIds']}
 for question in questions:question['lessonId']=destinations[question['lessonId']]
 return result
