jQuery(document).ready(function(){
	
	$('.img2').click(function(){
		$('.img1').animate({width:"120px",height:"auto"});
		$('.img2').animate({width:"150px",height:"auto"});
		$('.txt1').animate({top: 160, left: 50});
		$('.txt2').animate({bottom: 200, right: 80});
		$('.bar').animate({top: 70});
	});
	
	$('.img1').click(function(){
		$('.img2').animate({width:"120px",height:"auto"});
		$('.img1').animate({width:"150px",height:"auto"});
		$('.txt2').animate({bottom: 160, right: 50});
		$('.txt1').animate({top: 200, left: 80});
		$('.bar').animate({top: 180});
	});
	
	
});