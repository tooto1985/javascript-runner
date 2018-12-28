function todo () {
  console.log('aabbcc')
}

$(function () {
  $('#btn').click(function () {
    run()
  })

  function run () {
    todo()
  }
})
