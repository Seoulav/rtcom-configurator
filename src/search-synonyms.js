((scope)=>{
  const groups=[
    ['분배기','splitter','distribution amplifier'],
    ['선택기','switcher','selector'],
    ['익스텐더','extender','전송기','송수신기'],
    ['광','fiber','optical'],
    ['cat','utp','stp','hdbaset'],
    ['매트릭스','matrix','matrix switcher'],
    ['광케이블','aoc','active optical cable'],
    ['디스플레이포트','displayport','dp'],
    ['심리스','seamless'],
    ['비디오월','video wall','wall']
  ];
  const api={groups};
  scope.RtSearchSynonyms=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
