$(".book").on("mouse-position", function(event) {
  $(event.currentTarget)
    .find("p.info span.percentage")
    .html(getDistancePercentage(event, 25, 90));
  $(event.currentTarget)
    .find("p.info span.degrees")
    .html(getDegreesPercentage(event, 20));
});

function getDistancePercentage(event, offset, limit) {
  var trimmedPercentage = getPercentageWithLimits(
    event.mousePosition.distance,
    event.currentTarget.clientWidth / 2,
    offset,
    limit
  );

  return trimPercentage(trimmedPercentage);
}

function getDegreesPercentage(event, offset) {
  var trimmedPercentage = getPercentageWithLimits(
    event.mousePosition.degrees,
    90,
    offset
  );

  return trimPercentage(trimmedPercentage);
}

function getPercentageWithLimits(distance, totalDistance, offset, limit) {
  limit = limit || 100 - offset;
  var percentage = (distance / totalDistance) * 100;

  return ((percentage - offset) / (limit - offset)) * 100;
}

function trimPercentage(percentage) {
  if (percentage < 0) return 0;
  if (percentage > 100) return 100;

  return percentage.toFixed(2);
}
