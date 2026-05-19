export default function ConfidenceBadge({ confidence }) {
  if (!confidence && confidence !== 0) return null;
  
  let badgeClass = 'bg-gray-100 text-gray-600';
  let icon = '⚠️';
  
  if (confidence >= 0.8) {
    badgeClass = 'bg-green-100 text-green-700';
    icon = '✓';
  } else if (confidence >= 0.5) {
    badgeClass = 'bg-yellow-100 text-yellow-700';
    icon = '●';
  } else if (confidence > 0) {
    badgeClass = 'bg-red-100 text-red-700';
    icon = '!';
  }
  
  return (
    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1 ${badgeClass}`}>
      <span>{icon}</span>
      <span>{Math.round(confidence * 100)}%</span>
    </span>
  );
}
