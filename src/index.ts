import "./styles/index.scss";

( async () => {

	const Main = ( await import( "./entries/Main" ) ).default;
	const main = new Main();
	main._start();

} )();
